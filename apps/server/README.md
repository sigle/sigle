# @sigle/server

## Setup new Storacha Agent

First, install the Storacha cli:

```bash
pnpm add -g @storacha/cli
```

Then, login to your Storacha account:

```bash
storacha login <your_email>
```

Create a new agent:

```bash
storacha key create
```

Set the `STORACHA_AGENT_KEY` environment variable to the key provided.

Tell the agent to use the space:

```bash
storacha space use <your_space_name>
```

Create the proof for the agent, replace the did with the agent did you got previously

```bash
storacha delegation create <your_agent_did> --base64
```

Set the `STORACHA_AGENT_PROOF` with the base64 encoded proof that you got from the previous step.
