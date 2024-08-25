import { createFromJSON } from '@libp2p/peer-id-factory';
import { createLibp2p  } from 'libp2p'
import { noise } from '@chainsafe/libp2p-noise'
import { mplex } from '@libp2p/mplex'
import { yamux } from '@chainsafe/libp2p-yamux'
import { tcp } from '@libp2p/tcp'
import peerIdListenerJson from   './peer-id-listener';
import { stdinToStream, streamToConsole } from './stream';
import { webSockets } from '@libp2p/websockets'

async function run() {
  // Create a new libp2p node with the given multi-address
  const idListener = await createFromJSON(peerIdListenerJson);
  console.log(idListener.toString())
  const nodeListener = await createLibp2p({
    peerId: idListener,
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/10333'],
    },
    transports: [tcp(), webSockets()],
    connectionEncryption: [noise()],
    streamMuxers: [yamux()]
  })

  // Log a message when a remote peer connects to us
  nodeListener.addEventListener('peer:connect',   (evt: any) => {
    const remotePeer = evt.detail;
    console.log('connected to: ', remotePeer.toString());
  });

  // Handle messages for the protocol
  await nodeListener.handle('/chat/1.0.0', async ({ stream   
 }: any) => {
    // Send stdin to the stream
    stdinToStream(stream);
    // Read the stream and output to console
    streamToConsole(stream);
  });

  // Output listen addresses to the console
  console.log('Listener ready, listening on:');
  nodeListener.getMultiaddrs().forEach((ma: any)   => {
    console.log(ma.toString());
  });
}

run();   
