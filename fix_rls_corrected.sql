-- KORRIGERAT RLS Script - utan cirkulära referenser

-- Ta bort alla existerande RLS policies först
DROP POLICY IF EXISTS "Users can only access their company" ON companies;
DROP POLICY IF EXISTS "Users can access profiles from their company" ON user_profiles;
DROP POLICY IF EXISTS "Users can access leads from their company" ON leads;
DROP POLICY IF EXISTS "Users can access tags from their company" ON tags;
DROP POLICY IF EXISTS "Users can access lead tags from their company" ON lead_tags;
DROP POLICY IF EXISTS "Users can access email logs from their company" ON email_logs;
DROP POLICY IF EXISTS "Users can access reminders from their company" ON reminders;
DROP POLICY IF EXISTS "Users can access files from their company" ON files;

-- Stäng av RLS temporärt för user_profiles för att undvika cirkulära referenser
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Skapa enkla RLS policies utan cirkulära referenser
CREATE POLICY "Users can access own profile" ON user_profiles
    FOR ALL USING (user_id = auth.uid());

-- Aktivera RLS för user_profiles igen
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Nu kan vi skapa policies för andra tabeller som refererar till user_profiles
CREATE POLICY "Users can only access their company" ON companies
    FOR ALL USING (
        id IN (
            SELECT company_id FROM user_profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can access leads from their company" ON leads
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM user_profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can access tags from their company" ON tags
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM user_profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can access lead tags from their company" ON lead_tags
    FOR ALL USING (
        lead_id IN (
            SELECT id FROM leads 
            WHERE company_id IN (
                SELECT company_id FROM user_profiles 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can access email logs from their company" ON email_logs
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM user_profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can access reminders from their company" ON reminders
    FOR ALL USING (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE company_id IN (
                SELECT company_id FROM user_profiles 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can access files from their company" ON files
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM user_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- Enable RLS på alla tabeller
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Säkerställ behörigheter
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
