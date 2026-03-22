Create a nodejs service that serves as a telegram bot/claude cli bride.
Once connected, it should listen to messages from a specific telegram chat id and forward them to claude code cli.
My claude code cli is already fully setup.
The service will communicate with claude code cli using:

cd "<default directory>" && claude -c --allow-dangerously-skip-permissions -p "incoming message goes here"

and then send the reply to the specific telegram chat id (Stored in .env file).
<default directory> is stored in .env file.

The service does not process messages or respond to other telegram IDs aside from the one specified in .env file.
log all communication (Including unauthirized ones) between telegram and claude cli to a file.
rotate logs daily.
use .env for secrets.
