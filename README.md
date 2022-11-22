## Vizo GCP-Discord Bot

This is a bot intended to log to a Discord Channel the state of the most recent Google Cloud Build run of a project.

### Setup

1. Install the Google Cloud CLI

- Make sure you have the Google Cloud CLI installed and setup. For instructions on how to install, [Click here](https://cloud.google.com/sdk/docs/install)

2. Login into the Google Cloud CLI

- On your terminal, use the command `gcloud auth login` to login with your account into the Google Cloud CLI

3. Obtain the project's ID

- Use the command `gcloud projects list` and copy the ID of the desired project.

4. Obtain the Discord Bot Token

- To Obtain a Discord Bot Token, first you need to create an application in the [Discord Developer Portal](https://discord.com/developers/).
- After Logging in, create an Application, then click on the Bot option on the sidebar, setup your bot information and permissions and click on the Generate/Reset Token button.
- Copy the Token and keep it on a safe place

5. Add your Bot to the server

- To add the Bot to your server, first create an Invite link.
- Click on the OAuth2 Option on the sidebar then on the URL generator option.
- Select the `bot` scope. On the Bot Permissions panel, select `Send Messages` and `Send Messages in Threads`
- Copy the link generated at the bottom of the page and open it on a new tab.
- Select the desired server and click "Continue"

6. Copy the Channel/Thread ID

- Select the desired text channel inside your server and right click on its name.
- Select the `Copy ID` option
- You can also use a thread. Click on the Threads options at the top bar of the channel, click `Create`and send an initial message to create the thread. Then right click on its name and click on `Copy ID`.
- You can also just right click on any existing Thread and select `Copy ID`
- #### IMPORTANT!
- Your Bot must be able to see the channel you want it to send the message.
- To check that, right click on your server Icon, click on `Server Settings`, click on `Roles`, Select the role with the name of your Bot, scroll to the end and click on `View Server as Role` and see if the Bot can access the channel
- If not, right click on the channel, click on `Edit Channel`, then click on `Permissions` and add the Bot's role to the channel

7. Setup Bot Deployment

- On this repository, there's a `.env.example` file.
- Make a copy of it and rename it `.env`
- Open the `.env` file and fill out the variables
- `PROJECT_ID` will be the Project ID you copied on step 3
- `DISCORD_CHANNEL_ID` is the Discord text channel ID you copied on step 6
- Create a file named "key.txt" on the same folder as the `deploy.sh` script and paste the Discord Token from Step 4. **_Be careful with spaces or newlines when pasting!_**

8. Deploy the Bot

- Run the `deploy.sh` script. If you setup the .env file correctly and have the necessary permissions on the project you want to deploy, the script will run smoothly.
- The script will activate the necessary APIs on your GCP project, create the necessary Pub/Sub topic, deploy the Bot to Cloud Run and create a trigger from the Pub/Sub topic to the Cloud Run container of the bot.
