window.onload = function() {
  const vidContainer = document.getElementById("video-container");
  const videoOne = document.getElementById("video-one");
  const videoTwo = document.getElementById("video-two");
  const body = document.querySelector("body");

  setTimeout(function(e) {
    body.classList.add("fadein");
  }, 1000);

  // TODO: is this hacky
  let globalCT;

  const playButton = document.getElementById("play-button");
  const look_audio = new Audio("./audio/looped_audio.mp3");
  let initializedTime;

  function updateTime(videoToUpdate, videoRunning) {
    // TODO: ideally seek to keyframe

    const currentTime = videoRunning.currentTime;
    const duration = videoRunning.duration;

    const thisTime = Date.now();
    let newCT = (thisTime - initializedTime) / 1000;

    console.log({ currentTime, duration, newCT });

    if (newCT >= duration) {
      // alert("reset");
      newCT = 0;
      initializedTime = Date.now();
    }

    videoToUpdate.currentTime = newCT;

    // TODO: is this hacky
    globalCT = newCT;

    const vidRunningTime = videoRunning.currentTime;
    const vidToUpdateTime = videoToUpdate.currentTime;
    const vidOneCT = videoOne.currentTime;
    const vidTwoCT = videoTwo.currentTime;
    // console.log({ vidOneCT, vidTwoCT, vidRunningTime, vidToUpdateTime });
    // console.log({ initializedTime, thisTime, newCT, vidOneTime, vidTwoTime });
  }

  // adds and removes timeupdate event to appropriate element
  function syncOnTimeUpdate(e) {
    const id = e.srcElement.id;

    if (id === "video-two") {
      updateTime(videoOne, videoTwo);
    } else {
      updateTime(videoTwo, videoOne);
    }
  }

  // adds and removes timeupdate event to appropriate element
  function timeUpdateListener(videoOne, videoTwo) {
    if (videoOne.classList.contains("hide-video")) {
      videoOne.removeEventListener("timeupdate", syncOnTimeUpdate);
      videoTwo.addEventListener("timeupdate", syncOnTimeUpdate);
    } else {
      videoTwo.removeEventListener("timeupdate", syncOnTimeUpdate);
      videoOne.addEventListener("timeupdate", syncOnTimeUpdate);
    }
  }

  function exposeVideo(videoToShow, videoToHide) {
    const exposedVidToShow = videoToShow.currentTime;
    const exposedVidToHide = videoToHide.currentTime;
    const videoTwoCT = videoTwo.currentTime;

    // console.log({ exposedVidToShow, exposedVidToHide, videoTwoCT });

    // hide video
    videoToHide.classList.add("hide-video");
    videoToHide.pause();

    videoToShow.play();

    const playPromise = videoToShow.play();
    if (playPromise !== null) {
      playPromise.catch(() => {
        videoToShow.play();
      });
    }

    videoToShow.addEventListener("playing", function() {
      videoToShow.currentTime = globalCT;
      videoToShow.classList.remove("hide-video");
      timeUpdateListener(videoToShow, videoToHide);
    });
  }

  function firstPlay() {
    playButton.classList.add("display-none");
    videoOne.play();
    look_audio.play();
  }

  let vidStarted = false;
  function vidPlaying() {
    if (!vidStarted) {
      initializedTime = Date.now();
      timeUpdateListener(videoOne, videoTwo);
      vidStarted = true;
    } else {
      // console.log("tried to run vidPlaying but current time was not zero");
    }
  }

  function initializeVidOne() {
    if (!vidStarted) {
      videoOne.addEventListener("playing", vidPlaying);
    } else {
      videoOne.removeEventListener("playing", vidPlaying);
    }
  }

  // we need click event to fade this in

  //  // if videoOne.canPlay, fade in video-container
  //  if (videoOne.readyState >= videoOne.HAVE_FUTURE_DATA) {
  //   console.log("video ready state was true");
  //   vidContainer.classList.remove("no-opacity");
  // } else {
  //   videoOne.addEventListener("canplay", function() {
  //     console.log("videoOne can play");
  //     vidContainer.classList.remove("no-opacity");
  //   });
  // }

  initializeVidOne();

  // if videoOne.canPlay, fade in video-container

  playButton.addEventListener("click", function(e) {
    firstPlay();
  });

  vidContainer.addEventListener("click", function(e) {
    const oneCT = videoOne.currentTime;
    const twoCT = videoTwo.currentTime;
    // console.log({ oneCT, twoCT });

    // if video has never been clicked
    if (!vidStarted) {
      firstPlay();
    } else {
      console.log("in click fx else block");

      // TODO: add if videoTwo.paused is true, then:
      videoTwo.play();

      e.preventDefault();
      if (videoOne.classList.contains("hide-video")) {
        // console.log("will be exposing vid one");
        exposeVideo(videoOne, videoTwo);
      } else {
        // console.log("will be exposing vid two");
        exposeVideo(videoTwo, videoOne);
      }
    }
  });

  window.addEventListener("keydown", function(e) {
    const key = e.which || e.keyCode;

    if (key === 32) {
      // if video has never been clicked
      if (videoOne.currentTime === 0) {
        firstPlay();
      }

      // console.log("clicked space bar");
      if (videoOne.classList.contains("hide-video")) {
        console.log("will be exposing vid one");
        exposeVideo(videoOne, videoTwo);
        hideVideo(videoTwo, videoOne);
      } else {
        // console.log("will be exposing vid two");
        exposeVideo(videoTwo, videoOne);
        hideVideo(videoOne, videoTwo);
      }
    }
  });

  // determine if width is greater than height (portrait mode)
  if (window.innerWidth < window.innerHeight) {
    const p = document.getElementById("message");
    p.innerHTML = "For best viewing experience please rotate your device";
  }
};
