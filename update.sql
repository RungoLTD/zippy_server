ALTER TABLE users  ADD os_code int NOT NULL default 1, ADD version_build int NOT NULL default 0, ADD version_app int NOT NULL default 0;

CREATE TABLE `fishcoins` (
  `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `fishcoin` int unsigned NOT NULL,
  `fishcoin_money` int unsigned NOT NULL,
  `fishcoin_type` int unsigned NOT NULL
);

CREATE TABLE `banners` (
  `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `html_code` text NOT NULL,
  `show_date_start` date NOT NULL,
  `show_date_end` date NOT NULL
);

ALTER TABLE statistics ADD routes text NULL;
