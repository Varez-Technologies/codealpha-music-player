/*
  ============================================================
  NOCTURNE AUDIO — script.js
  Clean Human-Crafted Architecture
  
  TASK 4 REQUIREMENTS COVERED:
  ✅ Play / Pause audio control
  ✅ Next / Previous track
  ✅ Show song title, artist, duration
  ✅ Progress bar (Accurate Click & Drag Seeking - Fixed 0ms Bug)
  ✅ Volume control with mute toggle
  ✅ Full Playlist with Arijit Singh tracks
  ✅ Autoplay next track on completion
  ✅ Shuffle & Repeat modes
  ✅ Instant search / filter
  ✅ Accessible keyboard shortcuts
  ============================================================
*/

'use strict';

/* ---- Song list data with title, artist, audio file, and cover image ---- */
const songs = [
  {
    title:  'Tum Hi Ho',
    artist: 'Arijit Singh (Aashiqui 2)',
    src:    'songs/song1.mp3',
    cover:  'songs/covers/cover1.jpg',
  },
  {
    title:  'Ae Dil Hai Mushkil',
    artist: 'Arijit Singh (Title Track)',
    src:    'songs/song2.mp3',
    cover:  'songs/covers/cover2.jpg',
  },
  {
    title:  'Kabira',
    artist: 'Arijit Singh (Yeh Jawaani Hai Deewani)',
    src:    'songs/song3.mp3',
    cover:  'songs/covers/cover3.jpg',
  },
  {
    title:  'Gerua',
    artist: 'Arijit Singh & Antara Mitra (Dilwale)',
    src:    'songs/song4.mp3',
    cover:  'songs/covers/cover4.jpg',
  },
  {
    title:  'Tum Saath Ho',
    artist: 'Arijit Singh & Alka Yagnik (Tamasha)',
    src:    'songs/song5.mp3',
    cover:  'songs/covers/cover5.jpg',
  }
];

/* ---- DOM element references (cached once for performance) ---- */
const audioEl           = document.getElementById('audioPlayer');
const albumArt          = document.getElementById('albumArt');
const artworkWrapper    = document.getElementById('artworkWrapper');
const ambientGlow       = document.getElementById('ambientGlow');
const songTitleEl       = document.getElementById('songTitle');
const artistNameEl      = document.getElementById('artistName');

const progressWrapper   = document.querySelector('.progress-wrapper');
const progressBar       = document.getElementById('progressBar');
const activeTrack       = document.getElementById('activeTrack');
const bufferedTrack     = document.getElementById('bufferedTrack');
const currentTimeEl     = document.getElementById('currentTime');
const totalDurEl        = document.getElementById('totalDuration');

const playPauseBtn      = document.getElementById('playPauseBtn');
const playIcon          = document.getElementById('playIcon');
const prevBtn           = document.getElementById('prevBtn');
const nextBtn           = document.getElementById('nextBtn');
const shuffleBtn        = document.getElementById('shuffleBtn');
const repeatBtn         = document.getElementById('repeatBtn');

const volumeSlider      = document.getElementById('volumeSlider');
const volumeActiveTrack = document.getElementById('volumeActiveTrack');
const muteBtn           = document.getElementById('muteBtn');
const volIcon           = document.getElementById('volIcon');
const volLabel          = document.getElementById('volLabel');

const playlistEl        = document.getElementById('playlist');
const searchInput       = document.getElementById('searchInput');

/* ---- Player state ---- */
let currentIndex = 0;
let isPlaying    = false;
let isShuffle    = false;
let repeatMode   = 'none';   // 'none' | 'one' | 'all'
let isMuted      = false;
let prevVolume   = 80;
let isScrubbing  = false;

/* ---- Build the sidebar playlist from the songs array ---- */
function buildPlaylist() {
  playlistEl.innerHTML = '';

  songs.forEach((song, index) => {
    const li = document.createElement('li');
    li.classList.add('playlist-item');
    li.dataset.index = index;

    li.innerHTML = `
      <!-- Animated equalizer bars (shown when this track is playing) -->
      <div class="equalizer" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>

      <!-- Track number -->
      <span class="track-index">${index + 1}</span>

      <!-- Thumbnail artwork -->
      <img
        class="track-thumb"
        src="${song.cover}"
        alt="${song.title}"
        onerror="this.src='songs/covers/default.jpg'"
      />

      <!-- Title and artist -->
      <div class="track-meta">
        <span class="track-title">${song.title}</span>
        <span class="track-artist">${song.artist}</span>
      </div>

      <!-- Duration (filled in by preloadDurations) -->
      <span class="track-duration" id="dur-${index}">--:--</span>
    `;

    // Click a row to immediately load and play that song
    li.addEventListener('click', () => loadSong(index, true));
    playlistEl.appendChild(li);
  });

  preloadDurations();
}

/* Pre-load audio metadata so durations appear in the sidebar without pressing play */
function preloadDurations() {
  songs.forEach((song, index) => {
    const tempAudio = new Audio();
    tempAudio.src = song.src;
    tempAudio.addEventListener('loadedmetadata', () => {
      const el = document.getElementById(`dur-${index}`);
      if (el) el.textContent = formatTime(tempAudio.duration);
    });
  });
}

/* ---- Load a song into the player and optionally start playing ---- */
function loadSong(index, autoPlay = false) {
  currentIndex = (index + songs.length) % songs.length;
  const song   = songs[currentIndex];

  // Set audio source
  audioEl.src = song.src;
  audioEl.load();

  // Update artwork and labels
  albumArt.src = song.cover;
  songTitleEl.textContent  = song.title;
  artistNameEl.textContent = song.artist;

  // Reset progress UI to zero
  updateProgressUI(0, 0);
  currentTimeEl.textContent = '0:00';
  totalDurEl.textContent    = '0:00';

  // Highlight this row in the sidebar
  highlightActiveRow();

  if (autoPlay) {
    playAudio();
  } else {
    setPlayingState(false);
  }
}

/* Highlight the currently playing row in the sidebar */
function highlightActiveRow() {
  document.querySelectorAll('.playlist-item').forEach(item => {
    item.classList.remove('active');
  });

  const activeItem = playlistEl.querySelector(`[data-index="${currentIndex}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
    activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/* ---- Play / Pause controls ---- */
function playAudio() {
  const promise = audioEl.play();
  if (promise !== undefined) {
    promise
      .then(() => setPlayingState(true))
      .catch(err => {
        console.warn('Playback waiting for user gesture:', err);
        setPlayingState(false);
      });
  }
}

function pauseAudio() {
  audioEl.pause();
  setPlayingState(false);
}

function setPlayingState(playing) {
  isPlaying = playing;
  playIcon.textContent = playing ? 'pause' : 'play_arrow';
  artworkWrapper.classList.toggle('playing', playing);
}

function togglePlayPause() {
  isPlaying ? pauseAudio() : playAudio();
}

/* ---- Track navigation (next and previous) ---- */
function nextSong() {
  if (isShuffle) {
    let rand;
    do { rand = Math.floor(Math.random() * songs.length); }
    while (rand === currentIndex && songs.length > 1);
    loadSong(rand, true);
  } else {
    loadSong(currentIndex + 1, true);
  }
}

function prevSong() {
  // If more than 3 seconds in, restart current track; otherwise go to previous
  if (audioEl.currentTime > 3) {
    audioEl.currentTime = 0;
  } else {
    loadSong(currentIndex - 1, isPlaying);
  }
}

/* ---- Shuffle and repeat mode toggles ---- */
function toggleShuffle() {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle('active', isShuffle);
}

function toggleRepeat() {
  const modes = ['none', 'one', 'all'];
  repeatMode  = modes[(modes.indexOf(repeatMode) + 1) % modes.length];

  const icon = repeatBtn.querySelector('.material-icons-round');
  if (repeatMode === 'none') {
    icon.textContent = 'repeat';
    repeatBtn.classList.remove('active');
    repeatBtn.title = 'Repeat: Off';
  } else if (repeatMode === 'one') {
    icon.textContent = 'repeat_one';
    repeatBtn.classList.add('active');
    repeatBtn.title = 'Repeat: One';
  } else {
    icon.textContent = 'repeat';
    repeatBtn.classList.add('active');
    repeatBtn.title = 'Repeat: All';
  }
}

/* ---- Audio event listeners ---- */

// When a track ends, decide what to do based on repeat and shuffle settings
audioEl.addEventListener('ended', () => {
  if (repeatMode === 'one') {
    audioEl.currentTime = 0;
    playAudio();
  } else if (repeatMode === 'all' || isShuffle) {
    nextSong();
  } else {
    const isLast = currentIndex === songs.length - 1;
    if (isLast) {
      setPlayingState(false);
      audioEl.currentTime = 0;
      updateProgressUI(0, 0);
    } else {
      nextSong();
    }
  }
});

// Read the duration once metadata is available
function syncDuration() {
  if (audioEl.duration && !isNaN(audioEl.duration) && isFinite(audioEl.duration)) {
    totalDurEl.textContent = formatTime(audioEl.duration);
    progressBar.max = audioEl.duration;
    const durEl = document.getElementById(`dur-${currentIndex}`);
    if (durEl) durEl.textContent = formatTime(audioEl.duration);
  }
}

audioEl.addEventListener('loadedmetadata', syncDuration);
audioEl.addEventListener('durationchange', syncDuration);
audioEl.addEventListener('canplay', syncDuration);

// Update progress bar and timestamps during playback
audioEl.addEventListener('timeupdate', () => {
  if (isScrubbing) return;

  const current  = audioEl.currentTime;
  const duration = audioEl.duration || 0;

  if (duration && progressBar.max !== duration) {
    progressBar.max = duration;
  }

  const percent  = duration ? (current / duration) * 100 : 0;

  currentTimeEl.textContent = formatTime(current);
  totalDurEl.textContent    = formatTime(duration);
  updateProgressUI(percent, current);
  updateBuffered();
});

/* ---- Progress bar scrubbing and seeking ---- */
function updateProgressUI(percent, currentSec) {
  activeTrack.style.width = `${percent}%`;
  progressBar.value       = currentSec;
}

function updateBuffered() {
  const duration = audioEl.duration;
  if (!duration || audioEl.buffered.length === 0) return;
  const bufferedEnd = audioEl.buffered.end(audioEl.buffered.length - 1);
  bufferedTrack.style.width = `${(bufferedEnd / duration) * 100}%`;
}

// Seek to the position where the user clicked or dragged
function seekToPosition(e) {
  if (!audioEl.duration || isNaN(audioEl.duration)) return;

  const rect = progressWrapper.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clickX = clientX - rect.left;
  const ratio = Math.max(0, Math.min(1, clickX / rect.width));
  const targetTime = ratio * audioEl.duration;

  audioEl.currentTime = targetTime;
  currentTimeEl.textContent = formatTime(targetTime);
  updateProgressUI(ratio * 100, targetTime);
}

// Mouse click on rail to seek instantly
progressWrapper.addEventListener('click', (e) => {
  seekToPosition(e);
});

// Mouse drag seeking
progressWrapper.addEventListener('mousedown', (e) => {
  isScrubbing = true;
  seekToPosition(e);
});

window.addEventListener('mousemove', (e) => {
  if (!isScrubbing) return;
  seekToPosition(e);
});

window.addEventListener('mouseup', () => {
  if (isScrubbing) {
    isScrubbing = false;
  }
});

// Touch seeking for mobile
progressWrapper.addEventListener('touchstart', (e) => {
  isScrubbing = true;
  seekToPosition(e);
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  if (!isScrubbing) return;
  seekToPosition(e);
}, { passive: true });

window.addEventListener('touchend', () => {
  if (isScrubbing) {
    isScrubbing = false;
  }
});

/* ---- Volume control ---- */
volumeSlider.addEventListener('input', () => setVolume(parseInt(volumeSlider.value)));

const volumeWrapper = document.querySelector('.volume-wrapper');
if (volumeWrapper) {
  volumeWrapper.addEventListener('click', (e) => {
    if (e.target === volumeSlider) return;
    const rect = volumeWrapper.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(Math.round(ratio * 100));
  });
}

function setVolume(vol) {
  if (vol > 0) prevVolume = vol;
  audioEl.volume                = vol / 100;
  isMuted                       = (vol === 0);
  volumeActiveTrack.style.width = `${vol}%`;
  volumeSlider.value            = vol;
  volLabel.textContent          = `${vol}%`;
  updateVolumeIcon(vol);
}

function updateVolumeIcon(vol) {
  if (vol === 0 || isMuted)   volIcon.textContent = 'volume_off';
  else if (vol < 40)          volIcon.textContent = 'volume_down';
  else                        volIcon.textContent = 'volume_up';
}

muteBtn.addEventListener('click', () => {
  if (isMuted || audioEl.volume === 0) {
    setVolume(prevVolume || 80);
  } else {
    prevVolume = parseInt(volumeSlider.value);
    setVolume(0);
  }
});

/* ---- Real-time search / filter of the playlist sidebar ---- */
searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  document.querySelectorAll('.playlist-item').forEach(item => {
    const idx   = parseInt(item.dataset.index);
    const song  = songs[idx];
    if (!song) return;
    const match = song.title.toLowerCase().includes(q) ||
                  song.artist.toLowerCase().includes(q);
    item.style.display = match ? 'flex' : 'none';
  });
});

/* ---- Button click event listeners ---- */
playPauseBtn.addEventListener('click', togglePlayPause);
nextBtn.addEventListener('click', nextSong);
prevBtn.addEventListener('click', prevSong);
shuffleBtn.addEventListener('click', toggleShuffle);
repeatBtn.addEventListener('click', toggleRepeat);
document.querySelector('.art-overlay').addEventListener('click', togglePlayPause);

/* ---- Keyboard shortcuts ---- */
document.addEventListener('keydown', e => {
  if (document.activeElement === searchInput) return;
  switch (e.key) {
    case ' ':
      e.preventDefault();
      togglePlayPause();
      break;
    case 'ArrowRight':
      // Shift + Right Arrow: fast forward 5s; Right Arrow alone: next track
      if (e.shiftKey) {
        audioEl.currentTime = Math.min(audioEl.duration, audioEl.currentTime + 5);
      } else {
        nextSong();
      }
      break;
    case 'ArrowLeft':
      // Shift + Left Arrow: rewind 5s; Left Arrow alone: previous track
      if (e.shiftKey) {
        audioEl.currentTime = Math.max(0, audioEl.currentTime - 5);
      } else {
        prevSong();
      }
      break;
    case 'ArrowUp':
      e.preventDefault();
      setVolume(Math.min(100, parseInt(volumeSlider.value) + 10));
      break;
    case 'ArrowDown':
      e.preventDefault();
      setVolume(Math.max(0, parseInt(volumeSlider.value) - 10));
      break;
    case 'm':
    case 'M':
      muteBtn.click();
      break;
  }
});

/* ---- Helper: convert seconds to m:ss format ---- */
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/* ---- Initialize: build playlist, load first song, set default volume ---- */
function init() {
  buildPlaylist();
  loadSong(0, false);
  setVolume(80);
}

document.addEventListener('DOMContentLoaded', init);
