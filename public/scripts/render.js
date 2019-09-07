const hash = date => {
  date = new Date(+date);
  date.setHours(0,0,0,0);
  
  return date.getTime();
}

(async () => {
  const username = $("#data").data("username");
  
  let min = 1e100;
  let max = 0;
  
  const data = {};
  const dataByEvent = {};
  const safeAdd = (hash, event, start, end) => {
    if(!data[hash]) data[hash] = [];
    if(!dataByEvent[event]) dataByEvent[event] = [];
    data[hash].push({start, end});
    dataByEvent[event].push({start, end});
  }
  
  const tags = await $.get(`/api/${username}`);
  for(const {tag} of tags) {
    const times = await $.get(`/api/${username}/${tag}`);
    
    const currState = {
      last: -1,
      playing: false,
      hash: -1
    }
    
    times
      // Implicit pause now
      .concat({time: Date.now(), opt: "pause"})
      .sort((a, b) => a.time - b.time)
      .forEach(({opt, time}, i, arr) => {
        const curr = hash(time);
        if(opt === "pause") {
          if(currState.playing) { 
            while(curr !== currState.hash) {
              const oldHash = currState.hash;
              const nextHash = hash(new Date(+hash(currState.last) + 24 * 60 * 60 * 1000).getTime());
              safeAdd(oldHash, tag, currState.last, nextHash);
              
              currState.hash = nextHash;
              currState.last = currState.hash;
            }
            
            safeAdd(curr, tag, currState.last, time);
            currState.playing = false; 
          } else {
            if(i !== arr.length - 1) console.log("Possible error", times);
          }
        } else if(opt === "play") {
          currState.last = time;
          currState.hash = hash(time);
          currState.playing = true;
        }
        min = Math.min(min, time);
        max = Math.max(max, time);
      });
  }
  
  $("#timeline").width((max - min) / (60 * 1000));
  
  google.charts.load('current', {'packages':['timeline']});
  google.charts.setOnLoadCallback(() => {
    const container = document.getElementById("timeline");
    const chart = new google.visualization.Timeline(container);
    const dataTable = new google.visualization.DataTable();
    
    dataTable.addColumn({type: "string", id: "Type"});
    dataTable.addColumn({type: "date", id: "Start"});
    dataTable.addColumn({type: "date", id: "End"});
    
    Object.keys(dataByEvent).forEach(event => {
      const rows = dataByEvent[event];
      dataTable.addRows(
        rows.map(({start, end}) => {
          return ["" + event, new Date(+start), new Date(+end)]
        })
      );
    });
    
    chart.draw(dataTable);
  });
})();