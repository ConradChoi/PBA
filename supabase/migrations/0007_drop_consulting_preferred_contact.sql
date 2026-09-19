-- Consulting requests are answered at the email given when the diagnosis
-- started (collected with the mandatory privacy consent), so the consult form
-- no longer asks for a separate contact.
alter table consulting_requests drop column preferred_contact;
