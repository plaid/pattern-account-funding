envfile := ./.env

.PHONY: help install db-create db-reset sql server client ngrok

# help target adapted from https://gist.github.com/prwhite/8168133#gistcomment-2278355
TARGET_MAX_CHAR_NUM=20

## Show help
help:
	@echo ''
	@echo 'Usage:'
	@echo '  make <target>'
	@echo ''
	@echo 'Targets:'
	@awk '/^[a-zA-Z_0-9-]+:/ { \
		helpMessage = match(lastLine, /^## (.*)/); \
		if (helpMessage) { \
			helpCommand = substr($$1, 0, index($$1, ":")-1); \
			helpMessage = substr(lastLine, RSTART + 3, RLENGTH); \
			printf "  %-$(TARGET_MAX_CHAR_NUM)s %s\n", helpCommand, helpMessage; \
		} \
	} \
	{ lastLine = $$0 }' $(MAKEFILE_LIST)

## Install dependencies for client and server
install: $(envfile)
	cd client && npm install
	cd server && npm install

## Initialize the database (create tables)
db-create:
	psql -U postgres -f database/init/create.sql

## Drop and recreate the database
db-reset:
	psql -U postgres -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
	$(MAKE) db-create

## Start an interactive psql session
sql:
	psql -U postgres

## Start the server (port 5001)
server: $(envfile)
	cd server && npm start

## Start the client (port 3002)
client: $(envfile)
	cd client && npm start

## Start ngrok tunnel to expose server for webhooks
ngrok:
	ngrok http 5001

$(envfile):
	@echo "Error: .env file does not exist! See the README for instructions."
	@exit 1
