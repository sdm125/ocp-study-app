CREATE SEQUENCE hibernate_sequence START 1;

CREATE TABLE app_user(
  id int,
  name varchar(200),
  username varchar(200),
  password varchar(200),
  roles int,
  PRIMARY KEY( id)
);

CREATE TABLE role(
  id int,
  name varchar(200),
  PRIMARY KEY( id)
);

CREATE TABLE app_user_roles (
  app_user_id int,
  roles_id int
);

