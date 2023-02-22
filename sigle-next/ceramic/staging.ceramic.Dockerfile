FROM ceramicnetwork/js-ceramic:latest

WORKDIR /js-ceramic

COPY ceramic/staging.daemon.config.json daemon.config.json
COPY ceramic/entrypoint.sh entrypoint.sh
RUN chmod +x entrypoint.sh

EXPOSE 7007

ENTRYPOINT ["entrypoint.sh"]
CMD ["./packages/cli/bin/ceramic.js", "daemon", "--config", "daemon.config.json"]
