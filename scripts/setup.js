async function main() {
  const QuickNode = require('@quicknode/sdk');
  // if you are using ESM style imports, use this line instead:
  // import QuickNode from '@quicknode/sdk';

  const core = new Core({
    endpointUrl: 'https://maximum-bitter-voice.matic-amoy.quiknode.pro/d538c59307f7a37d1ab759a42b98c5f8d2594ef4/',
  })

  const currentBlockNumber = await core.client.getBlockNumber();
  console.log(currentBlockNumber)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });