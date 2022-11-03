#!/bin/bash
set -e
echo "Exporting env vars..."
set -a
. ./.env
set +a
command="gcloud auth list"
echo "Verifying if it's logged in"
string=$(gcloud auth list 2>&1)
if [[ $string == *"No credentialed accounts."* ]]; then
  echo "Make sure you're logged in the Google Cloud CLI"
  exit
fi

echo "Activating necessary APIs..."

gcloud services enable eventarc.googleapis.com \
    logging.googleapis.com \
    pubsub.googleapis.com \
    run.googleapis.com \
    workflows.googleapis.com \
    secretmanager.googleapis.com \
    --project $PROJECT_ID


echo "Setting necessary permissions..."

project=$(gcloud projects describe $PROJECT_ID)

part=$(echo $project| egrep -o "projectNumber: '[0-9]+'")
project_number=$(echo $part| egrep -o "[0-9]+")

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:$project_number@cloudbuild.gserviceaccount.com --role=roles/run.admin
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:$project_number@cloudbuild.gserviceaccount.com --role=roles/cloudbuild.builds.builder
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:$project_number@cloudbuild.gserviceaccount.com --role=roles/iam.serviceAccountUser


echo "Creating Pub/Sub topic..."

gcloud pubsub topics create cloud-builds --project $PROJECT_ID



echo "Creating Secret with Bot Token"

if ! [ -f "./key.txt" ]; then
    echo "Make sure to create the key file with the token"
    exit
fi

gcloud secrets create discord-token \
    --replication-policy="automatic" \
    --project $PROJECT_ID
gcloud secrets versions add discord-token \
    --data-file="key.txt" \
    --project $PROJECT_ID
echo "Deploying bot on Cloud Run..."


gcloud run deploy discord-bot \
    --project $PROJECT_ID \
    --image gcr.io/$PROJECT_ID/discord-bot \
    --region europe-west1 \
    --platform managed \
    --max-instances 10 \
    --min-instances 0 \
    --concurrency 160 \
    --cpu 1 \
    --memory 512Mi \
    --allow-unauthenticated \
    --set-env-vars DISCORD_CHANNEL_ID=$DISCORD_CHANNEL_ID,PROJECT_NUMBER=$project_number

echo "Creating trigger on EventArc..."

gcloud eventarc triggers create discord-bot-trigger \
    --location=europe-west1 \
    --destination-run-service=discord-bot \
    --destination-run-region=europe-west1 \
    --event-filters="type=google.cloud.pubsub.topic.v1.messagePublished" \
    --transport-topic=projects/$PROJECT_ID/topics/cloud-builds \
    --project $PROJECT_ID