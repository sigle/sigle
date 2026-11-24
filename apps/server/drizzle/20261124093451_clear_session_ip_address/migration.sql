-- Sessions stopped storing the client IP (better-auth `disableIpTracking`).
-- Clear the IPs stored before, to the empty string new sessions get.
UPDATE `session` SET `ip_address` = '' WHERE `ip_address` <> '';
