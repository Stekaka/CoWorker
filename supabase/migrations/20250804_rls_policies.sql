-- Row Level Security (RLS) Policies för Multi-tenant säkerhet

-- Companies: Endast members kan se sitt företag
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own company" ON companies
    FOR ALL USING (
        id IN (
            SELECT company_id FROM user_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- User profiles: Användare kan bara se profiler inom sitt företag
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see profiles in their company" ON user_profiles
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM user_profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all profiles" ON user_profiles
    FOR ALL USING (auth.role() = 'service_role');

-- Leads: Endast företagets användare kan se leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see leads in their company" ON leads
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM user_profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create leads in their company" ON leads
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM user_profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update leads in their company" ON leads
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM user_profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can delete leads in their company" ON leads
    FOR DELETE USING (
        company_id IN (
            SELECT company_id FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Tags: Företagsspecifika taggar
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see tags in their company" ON tags
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM user_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- Lead tags: Samma som leads
ALTER TABLE lead_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage lead tags in their company" ON lead_tags
    FOR ALL USING (
        lead_id IN (
            SELECT l.id FROM leads l
            JOIN user_profiles up ON l.company_id = up.company_id
            WHERE up.user_id = auth.uid()
        )
    );

-- Email logs: Företagsspecifika
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see email logs in their company" ON email_logs
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM user_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- Reminders: Användare kan bara se sina egna + admins kan se alla i företaget
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own reminders" ON reminders
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can see all reminders in their company" ON reminders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN leads l ON reminders.lead_id = l.id
            WHERE up.user_id = auth.uid() 
            AND up.role = 'ADMIN'
            AND l.company_id = up.company_id
        )
    );

CREATE POLICY "Users can manage their own reminders" ON reminders
    FOR ALL USING (
        user_id IN (
            SELECT id FROM user_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- Files: Företagsspecifika filer
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see files in their company" ON files
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM user_profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can upload files to their company" ON files
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM user_profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own uploaded files" ON files
    FOR DELETE USING (
        uploaded_by_id IN (
            SELECT id FROM user_profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can delete any file in their company" ON files
    FOR DELETE USING (
        company_id IN (
            SELECT company_id FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'ADMIN'
        )
    );
