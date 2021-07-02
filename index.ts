import { Subscription, PubSub } from "@google-cloud/pubsub";
import { slice, map, sortBy, update, updateWith } from 'lodash';
import * as fs from 'fs';

const viewDefnMap: {[defnName: string]: number} = {

}
const timeDefnVersion: {[day: number]: { [hour: number]: {[defnName: string]: number}}} = {};

function getTimeStamp() {
  let current = new Date();
  return `${current.getFullYear()}${current.getMonth()}${current.getDate()}${current.getHours()}${current.getMinutes()}${current.getSeconds()}`
}
async function quickstart(
  projectId = 'express-210300', // Your Google Cloud Platform project ID
  topicName = 'ViewDefn_pubsub_exqa', // Name for the new topic to create
  subscriptionName = 'ViewDefn_Log_exqa_subscriber2' // Name for the new subscription to create
) {
  // Instantiates a client
  const pubsub = new PubSub({projectId});

  // Creates a new topic
  const topic = pubsub.topic(topicName);
  // const [topic] = await pubsub.createTopic(topicName);
  console.log(`Topic ${topic.name} created.`);
  let subscription: Subscription;
  // Creates a subscription on that new topic
  await (topic.getSubscriptions().then(async response => {
    const subscriptions: Subscription[] = response[0];
    subscription = subscriptions.find(sub => sub.name.indexOf(subscriptionName)>=0);
    if ( subscription == null) {
      [subscription] = await topic.createSubscription(subscriptionName);
    } 
  }));

  // Receive callbacks for new messages on the subscription
  subscription.on('message', message => {
    // console.log('Received message:', message.data.toString());
    const msgData = JSON.parse(message.data.toString());
    const defnName = msgData.textPayload.match(/defnId=(\S*)/)[1];
    update(viewDefnMap, defnName, (n) => n ? n+1 : 1);
    updateWith(timeDefnVersion, `${message.publishTime.getDay()}.${message.publishTime.getHours()}.${defnName}`, (n) => n ? n+1 : 1, Object);

    console.log(
      slice(
        map(
          sortBy(
            map(viewDefnMap, (v, k) => { return [k, v] }),
            (x) => -x[1]),
          (v) => `${v[0]}: ${v[1]}`
        ),
        0,
        5
      )
    );
    // process.exit(0);
  });

  // Receive callbacks for errors on the subscription
  subscription.on('error', error => {
    console.error('Received error:', error);
    process.exit(1);
  });

  // Send a message to the topic
  // topic.publish(Buffer.from('Test message!'));
}

quickstart().then(() => {
  console.info("Started listening.");
});

function exitHandler() {
  fs.writeFileSync(`./output/timedata_${getTimeStamp()}.json`, JSON.stringify(timeDefnVersion, null, 2));
  fs.writeFileSync(`./output/alldata_${getTimeStamp()}.json`, JSON.stringify(viewDefnMap, null, 2));
  process.exit(0);
}
process.on('SIGINT', exitHandler);
process.on('exit', exitHandler);
process.on('uncaughtException', exitHandler);