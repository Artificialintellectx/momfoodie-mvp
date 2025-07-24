-- Analytics Tables Schema for MomFudy

-- Table for tracking page visits
CREATE TABLE IF NOT EXISTS analytics_visits (
  id SERIAL PRIMARY KEY,
  page VARCHAR(100) NOT NULL,
  user_agent TEXT,
  ip_address VARCHAR(45),
  session_id VARCHAR(100),
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking suggestion clicks
CREATE TABLE IF NOT EXISTS analytics_suggestions (
  id SERIAL PRIMARY KEY,
  button_type VARCHAR(100) NOT NULL,
  search_criteria JSONB,
  session_id VARCHAR(100),
  ip_address VARCHAR(45),
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking user sessions
CREATE TABLE IF NOT EXISTS analytics_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(100) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_analytics_visits_page ON analytics_visits(page);
CREATE INDEX IF NOT EXISTS idx_analytics_visits_visited_at ON analytics_visits(visited_at);
CREATE INDEX IF NOT EXISTS idx_analytics_visits_ip ON analytics_visits(ip_address);
CREATE INDEX IF NOT EXISTS idx_analytics_visits_session ON analytics_visits(session_id);

CREATE INDEX IF NOT EXISTS idx_analytics_suggestions_button_type ON analytics_suggestions(button_type);
CREATE INDEX IF NOT EXISTS idx_analytics_suggestions_clicked_at ON analytics_suggestions(clicked_at);
CREATE INDEX IF NOT EXISTS idx_analytics_suggestions_ip ON analytics_suggestions(ip_address);
CREATE INDEX IF NOT EXISTS idx_analytics_suggestions_session ON analytics_suggestions(session_id);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_session ON analytics_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_started_at ON analytics_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_ip ON analytics_sessions(ip_address);

-- Row Level Security (RLS) policies
ALTER TABLE analytics_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;

-- Allow all operations for analytics (since this is for tracking)
CREATE POLICY "Allow all analytics operations" ON analytics_visits FOR ALL USING (true);
CREATE POLICY "Allow all analytics operations" ON analytics_suggestions FOR ALL USING (true);
CREATE POLICY "Allow all analytics operations" ON analytics_sessions FOR ALL USING (true);

-- Comments for documentation
COMMENT ON TABLE analytics_visits IS 'Tracks page visits for website analytics';
COMMENT ON TABLE analytics_suggestions IS 'Tracks meal suggestion clicks for user behavior analysis';
COMMENT ON TABLE analytics_sessions IS 'Tracks user sessions and time spent on website'; 