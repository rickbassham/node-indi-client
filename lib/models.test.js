const { oneNumber, newNumberVector } = require("./models");

test("oneNumber name and value aren't null", () => {
  expect(JSON.parse(JSON.stringify(new oneNumber("NAME", "123")))).toMatchObject(
    { name: "NAME", value: 123 }
  )
});

test("sexagesimal number in oneNumber works", () => {
  expect(JSON.parse(JSON.stringify(new oneNumber("NAME", "90:00:00")))).toMatchObject(
    { name: "NAME", value: 90 }
  )
})

test("negative sexagesimal number in oneNumber works", () => {
  expect(JSON.parse(JSON.stringify(new oneNumber("NAME", "-90:01:00")))).toMatchObject(
    { name: "NAME", value: -(90 + 1/60) }
  )
})

test("sexagesimal number to xml works", () => {
  const data = new newNumberVector("device", "name", null, [
    new oneNumber("NAME", "90:00:00"),
  ]);

  expect(data.toXML()).toBe('<newNumberVector device="device" name="name"><oneNumber name="NAME">90</oneNumber></newNumberVector>');
});
