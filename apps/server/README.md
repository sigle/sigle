# @sigle/server

## Setup new W3UP Agent

First, install the W3UP agent:

```bash
pnpm add -g @web3-storage/w3cli
```

Then, login to your W3UP account:

```bash
w3 login <your_email>
```

Create a new agent:

```bash
w3 key create
```

Set the `W3UP_AGENT_KEY` environment variable to the key provided.


Tell the agent to use the space:

```bash
w3 space use <your_space_name>
```

Create the proof for the agent, replace the did with the agent did you got previously

```bash
w3 delegation create <your_agent_did> --base64
```

Set the `W3UP_AGENT_PROOF` with the base64 encoded proof that you got from the previous step.
