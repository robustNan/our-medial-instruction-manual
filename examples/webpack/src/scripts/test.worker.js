self.onmessage = ({ data }) => {
  self.postMessage(data[0] + data[1]);
};
