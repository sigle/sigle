FROM ceramicnetwork/js-ceramic:latest

WORKDIR /js-ceramic

COPY sigle-next/ceramic/staging.daemon.config.json daemon.config.json

EXPOSE 7007

ENTRYPOINT ["./packages/cli/bin/ceramic.js", "daemon", "--config", "daemon.config.json"]
