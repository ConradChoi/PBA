-- Privacy consent is optional: an anonymous diagnosis stores no name, email,
-- or consent time. They're filled in later if the person requests a
-- consultation (which asks for consent and contact details at that point).
alter table assessments alter column name drop not null;
alter table assessments alter column email drop not null;
