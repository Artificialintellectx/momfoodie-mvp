export default function handler(req, res) {
  // Get IP from various headers (for different hosting environments)
  const ip = req.headers['x-forwarded-for'] || 
             req.headers['x-real-ip'] || 
             req.connection.remoteAddress || 
             req.socket.remoteAddress ||
             (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
             'unknown'

  // Clean up IP address (remove IPv6 prefix if present)
  const cleanIP = ip.includes('::ffff:') ? ip.split('::ffff:')[1] : ip

  res.status(200).json({ ip: cleanIP })
} 