const username = $("#data").data("username");
  
const data = {};
const state = {};
(async () => {
  const tags = await $.get(`/api/${username}`);
  for(const {tag} of tags) {
    data[tag] = [];
    const currState = {
      time: 0,
      last: -1,
      playing: false
    }

    const start = new Date();
    start.setHours(0,0,0,0);
    
    const times = await $.get(`/api/${username}/${tag}?lim=${start.getTime()}`);

    if(times.length !== 0) times
      // Implicitly start at midnight
      .concat({opt: "play", time: start.getTime()})
      .sort((a, b) => a.time - b.time)
      .forEach(({opt, time}) => {
        if(opt === "pause") {
          currState.time += time - currState.last;
          currState.playing = false; 
        } else if(opt === "play") {
          currState.last = time;
          currState.playing = true;
        }
      });

    state[tag] = currState;
    init(tag, false);

    if(currState.playing) {
      $(`.playbtn[data-tag="${tag}"]`).addClass("paused");
    }
  };

  $("#name").on("keypress", e => {
    if(e.which === 13) {
      init($("#name").val(), true);
      $("#name").val("");
    }
  })

  setInterval(() => {
    for(const [tag, data] of Object.entries(state)) {
      if(data.playing) {
        const time = Date.now();
        data.time += time - data.last;
        data.last = time;

        setTime($(`.time[data-tag="${tag}"]`), data.time);
      }
    }
  }, 10);
})();
