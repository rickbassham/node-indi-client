# indi-client

A node client for [INDI](https://indilib.org/).

This client will translate the XML INDI protocol into a more JS friendly JSON.

Here's an example that will send all INDI protocol messages received to MQTT topics,
and will subscribe to MQTT topics to send commands to INDI devices.

## Installation

```bash
npm install indi-client
```

## Example

```js
const mqtt = require("mqtt");

const {
  getProperties,
  enableBLOB,
  mapping,
  newSwitchVector,
  newTextVector,
  newNumberVector,
  INDIClient,
} = require("indi-client");

const brokerURL = process.env.MQTT_BROKER_URL || "mqtt://127.0.0.1";
const indiHost = process.env.INDI_HOST || "127.0.0.1";
const indiPort = process.env.INDI_PORT ? parseInt(process.env.INDI_PORT) : 7624;

const indiClient = new INDIClient(indiHost, indiPort);

indiClient.on("connect", () => {
  console.log("indi connection connected");

  indiClient.getProperties();

  // Don't get blobs, most MQTT clients can't handle messages of that size.
  indiClient.enableBLOB(null, null, "Never");
})

indiClient.on("close", () => {
  console.log("indi connection closed");
})

indiClient.connect();

const mqttClient = mqtt.connect(brokerURL);

Object.keys(mapping).forEach(key => {
  indiClient.on(key, (obj) => {
    let topic = `indi/data/${obj.device}`;

    if (obj.name) topic += `/${obj.name}`;

    topic += `/${key}`;

    mqttClient.publish(topic, JSON.stringify(obj));
  })
});

mqttClient.on("connect", () => {
  mqttClient.subscribe("indi/commands/+", (err) => {
    if (err)
      console.error(err);
  });
});

mqttClient.on("message", (topic, message) => {
  if (topic.endsWith("newTextVector")) {
    const obj = newTextVector.fromJSON(JSON.parse(message));
    indiClient.send(obj);
  } else if (topic.endsWith("newSwitchVector")) {
    const obj = newSwitchVector.fromJSON(JSON.parse(message));
    indiClient.send(obj);
  } else if (topic.endsWith("newNumberVector")) {
    const obj = newNumberVector.fromJSON(JSON.parse(message));
    indiClient.send(obj);
  } else if (topic.endsWith("getProperties")) {
    const obj = getProperties.fromJSON(JSON.parse(message));
    indiClient.send(obj);
  } else if (topic.endsWith("enableBLOB")) {
    const obj = enableBLOB.fromJSON(JSON.parse(message));
    indiClient.send(obj);
  }
});
```
