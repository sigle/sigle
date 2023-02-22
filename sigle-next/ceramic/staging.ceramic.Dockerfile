FROM ceramicnetwork/js-ceramic:latest

WORKDIR /js-ceramic

# Required to get the envsubst command to work in the entrypoint.sh script
RUN apt-get install gettext-base

COPY ceramic/staging.daemon.config.json daemon.config.json
COPY ceramic/entrypoint.sh entrypoint.sh
RUN chmod +x entrypoint.sh

EXPOSE 7007

ENTRYPOINT ["./entrypoint.sh"]
