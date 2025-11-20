import React, { useEffect, useMemo, useState, useRef } from "react";

/**
 * Album Progress Dashboard — v3
 * Changes in this pass:
 * - Card size: h-[462px] w-[370px] (fits 2×5 on 1920×1080)
 * - No footer; page has no outer scrollbar (overflow-hidden)
 * - Stage title is inside the progress bar (no % text in bars)
 * - Remove button (×) inline to the right of each bar
 * - Clicking a bar opens a modal that lets you edit the stage name + progress (with slider)
 * - No max stage count; scroll appears inside card if too many
 * - “+” only for Add Bit button
 * - Zoom view centers a single song on a pure black background; UI is the same but enlarged
 */

const DEFAULT_STAGE_NAMES = [
  "Demo",
  "Lyrics",
  "Drums",
  "Bass",
  "Rhythm Guitars",
  "Lead Guitar / Solo",
  "Vocals",
  "Mix",
];

const DEFAULT_TEMPO = 120;

const NOTES = [
  { value: 'C', label: 'C' },
  { value: 'Db', label: 'C#/Db' },
  { value: 'D', label: 'D' },
  { value: 'Eb', label: 'D#/Eb' },
  { value: 'E', label: 'E' },
  { value: 'F', label: 'F' },
  { value: 'F#', label: 'F#/Gb' },
  { value: 'G', label: 'G' },
  { value: 'Ab', label: 'G#/Ab' },
  { value: 'A', label: 'A' },
  { value: 'Bb', label: 'A#/Bb' },
  { value: 'B', label: 'B' }
];

const MODES = ['Major', 'Minor'];

const DEFAULT_SONGS = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  title: `Song ${i + 1}`,
  stages: DEFAULT_STAGE_NAMES.map((name) => ({ name, value: 0 })),
  tempo: DEFAULT_TEMPO,
  key: null,
  duration: { minutes: 0, seconds: 0 },
  isDraft: false, // Default to non-draft status
}));

const STORAGE_KEY = "albumProgress_v3";

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return hash;
}

function formatDHMS(ms) {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

function useCountdown(targetISO) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const target = useMemo(() => new Date(targetISO).getTime(), [targetISO]);
  const remaining = Math.max(0, target - now);
  return formatDHMS(remaining);
}

const clamp01 = (v) => Math.min(100, Math.max(0, v));

// Tempo validation helper
function validateTempo(input) {
  const parsed = parseFloat(input);
  if (isNaN(parsed)) return DEFAULT_TEMPO;
  const rounded = Math.round(parsed);
  return Math.max(30, Math.min(300, rounded));
}

// Duration helper functions
const formatDuration = (minutes, seconds) => {
  const mins = Math.floor(minutes);
  const secs = Math.floor(seconds);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const validateDuration = (minutes, seconds) => {
  const clampedMins = Math.max(0, Math.min(59, Math.floor(parseInt(minutes) || 0)));
  const clampedSecs = Math.max(0, Math.min(59, Math.floor(parseInt(seconds) || 0)));
  return { minutes: clampedMins, seconds: clampedSecs };
};

// Helper function to format total album duration
const formatTotalDuration = (totalMinutes) => {
  if (totalMinutes >= 59940) return "999h+"; // Cap at 999 hours

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};

// Parse key string into [note, mode]
function parseKey(keyString) {
  if (!keyString) return [null, null];
  const parts = keyString.split(' ');
  return [parts[0], parts[1]];
}

// Normalize note based on mode conventions
function normalizeNote(note, mode) {
  const majorConversions = { 'C#': 'Db', 'D#': 'Eb', 'G#': 'Ab', 'A#': 'Bb' };
  const minorConversions = { 'Db': 'C#' };

  if (mode === 'Major' && majorConversions[note]) return majorConversions[note];
  if (mode === 'Minor' && minorConversions[note]) return minorConversions[note];
  return note;
}

function ProgressBar({ value, editable = false, onClick, height = "h-4", label }) {
  const pct = clamp01(value);
  const barColor = pct >= 100 ? "bg-emerald-700" : "bg-amber-700";
  return (
    <div className="w-full flex items-center gap-2">
      <div
        className={`relative w-full ${height} bg-neutral-800 rounded-full overflow-hidden ${editable ? "cursor-pointer" : ""}`}
        onClick={editable ? onClick : undefined}
        title={editable ? "Click to edit" : undefined}
      >
        <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
        {label && (
          <div className="absolute inset-0 flex items-center justify-center text-[11px] sm:text-sm font-medium text-white/90">
            {label}
          </div>
        )}
      </div>
    </div>
  );
}

function EditableText({ text, onSubmit, className, placeholder }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(text || "");
  useEffect(() => setVal(text || ""), [text]);
  return editing ? (
    <input
      className={`bg-neutral-900 border border-neutral-700 rounded px-2 py-1 w-full focus:outline-none focus:ring ${className || ""}`}
      value={val}
      placeholder={placeholder}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => {
        setEditing(false);
        onSubmit((val || placeholder || text || "").trim());
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          setVal(text || "");
          setEditing(false);
        }
      }}
      autoFocus
    />
  ) : (
    <div className={`cursor-text ${className || ""}`} onClick={() => setEditing(true)}>
      {val || placeholder || ""}
    </div>
  );
}

function EditStagePrompt({ initialName, initialValue, onClose }) {
  const [name, setName] = useState(initialName || "");
  const [val, setVal] = useState(String(initialValue ?? 0));
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-5 w-full max-w-md space-y-4">
        <div className="text-lg font-semibold">Edit bit</div>
        <div className="space-y-2">
          <label className="text-sm text-neutral-300">Name</label>
          <input
            className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 focus:outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-neutral-300">Progress: {clamp01(Number(val) || 0)}%</label>
          <input type="range" min={0} max={100} value={Number(val) || 0} onChange={(e) => setVal(e.target.value)} className="w-full" />
        </div>
        <div className="flex gap-2 justify-end">
          <button className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700" onClick={() => onClose(null)}>
            Cancel
          </button>
          <button className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500" onClick={() => onClose({ name: name.trim() || initialName, value: clamp01(Number(val) || 0) })}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function ExportImport({ songs, albumTitle, targetISO }) {
  const exportJSON = async () => {
	  const data = JSON.stringify({ songs, albumTitle, targetISO }, null, 2);

	  // If supported (Chromium browsers), let the user pick the exact file to overwrite
	  if ('showSaveFilePicker' in window) {
		try {
		  const handle = await window.showSaveFilePicker({
			suggestedName: 'album_dashboard.json',
			types: [
			  { description: 'JSON', accept: { 'application/json': ['.json'] } },
			],
			// You can try to suggest a start folder, but the browser decides:
			// startIn: 'documents' // or 'desktop' (cannot pre-fill F:\ path)
		  });
		  const writable = await handle.createWritable();
		  await writable.write(new Blob([data], { type: 'application/json' }));
		  await writable.close();
		  return;
		} catch (e) {
		  if (e?.name === 'AbortError') return; // user canceled
		  console.error(e);
		  alert('Could not save using the file picker. Falling back to download.');
		}
	  }

	  // Fallback: normal download to the browser’s default folder
	  const blob = new Blob([data], { type: 'application/json' });
	  const url = URL.createObjectURL(blob);
	  const a = document.createElement('a');
	  a.href = url;
	  a.download = 'album_dashboard.json';
	  a.click();
	  URL.revokeObjectURL(url);
	};

	const importJSON = async () => {
	  // If supported, let user pick the file directly
	  if ('showOpenFilePicker' in window) {
		try {
		  const [handle] = await window.showOpenFilePicker({
			types: [
			  { description: 'JSON', accept: { 'application/json': ['.json'] } },
			],
			multiple: false,
		  });
		  const file = await handle.getFile();
		  const txt = await file.text();
		  const data = JSON.parse(txt);
		  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
		  window.location.reload();
		  return;
		} catch (e) {
		  if (e?.name === 'AbortError') return; // user canceled
		  console.error(e);
		  alert('Could not open using the file picker. Falling back to upload.');
		}
	  }

	  // Fallback: classic file input
	  const input = document.createElement('input');
	  input.type = 'file';
	  input.accept = '.json,application/json';
	  input.onchange = () => {
		const file = input.files?.[0];
		if (!file) return;
		file.text().then((txt) => {
		  try {
			const data = JSON.parse(txt);
			localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
			window.location.reload();
		  } catch {
			alert('Invalid JSON file');
		  }
		});
	  };
	  input.click();
	};

  const resetData = () => {
    if (confirm("Reset all data to defaults?")) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };
  return (
    <div className="flex items-center gap-2">
      <button className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700" onClick={exportJSON}>
        Export
      </button>
      <button className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700" onClick={importJSON}>
        Import
      </button>
      <button className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700" onClick={resetData}>
        Reset
      </button>
    </div>
  );
}

function songAverage(song) {
  if (!song.stages?.length) return 0;
  const sum = song.stages.reduce((a, s) => a + clamp01(s.value || 0), 0);
  return Math.round((100 * sum) / (song.stages.length * 100));
}

function albumAverage(songs) {
  if (!songs.length) return 0;
  const sum = songs.reduce((a, s) => a + songAverage(s), 0);
  return Math.round(sum / songs.length);
}

function eligibleCount(songs, threshold = 75) {
  return [...songs].filter(s => songAverage(s) >= threshold).length;
}

function Header({ targetISO, setTargetISO, songs, albumTitle, setAlbumTitle }) {
  const { days, hours, minutes, seconds } = useCountdown(targetISO);
  const [editingDate, setEditingDate] = useState(false);

  // Calculate total album duration (memoized)
  const totalDuration = useMemo(() => {
    // Filter out draft songs before calculation
    const nonDraftSongs = songs.filter(song => !song.isDraft);

    const totalSeconds = nonDraftSongs.reduce((acc, song) => {
      if (!song.duration) return acc; // Handle missing duration field

      const minutes = Math.max(0, song.duration.minutes || 0);
      const seconds = Math.max(0, song.duration.seconds || 0);
      const songSeconds = (minutes * 60) + seconds;

      return acc + songSeconds;
    }, 0);

    return Math.floor(totalSeconds / 60); // Return total minutes
  }, [songs]);

  return (
    <div className="w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4">
      <div className="flex items-center gap-4">
        <EditableText
          text={albumTitle}
          onSubmit={setAlbumTitle}
          className="text-2xl font-black tracking-wider"
          placeholder="Album Title"
        />
      </div>

	  <div className="flex flex-col items-center">
	  <div className="text-2xl font-black tracking-wider">
	  {eligibleCount(songs, 90)}/13
	  </div>
	  <div className="text-sm text-neutral-400">
	  {formatTotalDuration(totalDuration)}
	  </div>
	  </div>

      <div className="flex items-center gap-3 text-right">
        {editingDate ? (
          <input
            type="datetime-local"
            className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1"
            value={toLocalDatetimeInputValue(targetISO)}
            onChange={(e) => setTargetISO(fromLocalDatetimeInputValue(e.target.value))}
            onBlur={() => setEditingDate(false)}
            autoFocus
          />
        ) : (
          <div className="cursor-pointer" onClick={() => setEditingDate(true)} title="Click to edit target deadline">
            <div className="uppercase text-xs tracking-widest text-neutral-400">Time to Goal</div>
            <div className="text-2xl tabular-nums font-semibold">
              {days}d {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>
            <div className="text-xs text-neutral-500">Target: {new Date(targetISO).toLocaleString()}</div>
          </div>
        )}
        <ExportImport songs={songs} albumTitle={albumTitle} targetISO={targetISO} />
      </div>
    </div>
  );
}

function StageRow({ stage, onApply, onRemove, stageRowHeight = "h-4", draggable = false, onDragStart, onDragOver, onDrop, onDragEnd, onKeyDown, onTouchStart, onTouchMove, onTouchEnd, stageIndex, isDragging, isDropTarget }) {
  const [promptOpen, setPromptOpen] = useState(false);

  return (
    <div
      className={`flex items-center gap-2 ${draggable && !promptOpen ? 'cursor-grab' : ''} ${isDragging ? 'opacity-50 cursor-grabbing' : ''} ${isDropTarget ? 'border-t-2 border-amber-500' : ''}`}
      draggable={draggable && !promptOpen}
      tabIndex={draggable ? 0 : undefined}
      data-stage-index={stageIndex}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex-1">
        <ProgressBar
          value={stage.value}
          label={stage.name}
          editable
          onClick={() => setPromptOpen(true)}
		  height = {stageRowHeight}
        />
      </div>
      <button
        className="shrink-0 w-6 h-3 flex items-center justify-center rounded bg-neutral-800 hover:bg-neutral-700 text-xs"
        onClick={onRemove}
        title="Remove"
      >
        ×
      </button>

      {promptOpen && (
        <EditStagePrompt
          initialName={stage.name}
          initialValue={stage.value}
          onClose={(res) => {
            setPromptOpen(false);
            if (!res) return;
            // single commit with both name & value
            onApply(res.name, res.value);
          }}
        />
      )}
    </div>
  );
}


function SongCard({ song, index, onUpdate, onZoom, onDragStart, onDragOver, onDrop, onDragEnd, isDraggingSong, isDropTargetSong }) {
  const avg = songAverage(song);
  const [tempoInput, setTempoInput] = useState(song.tempo.toString());
  const [showTempoFeedback, setShowTempoFeedback] = useState(false);
  const [isEditingTempo, setIsEditingTempo] = useState(false);
  const [isEditingKey, setIsEditingKey] = useState(false);

  const [selectedNote, selectedMode] = parseKey(song.key);
  const [tempKeyNote, setTempKeyNote] = useState(selectedNote);
  const [tempKeyMode, setTempKeyMode] = useState(selectedMode);

  // Duration edit state
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [tempMinutes, setTempMinutes] = useState("");
  const [tempSeconds, setTempSeconds] = useState("");

  // Drag-and-drop state (T006-T008, T045)
  const draggedIndexRef = useRef(null);
  const [dropTargetIndex, setDropTargetIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const touchTimerRef = useRef(null);
  const initialTouchYRef = useRef(null);

  const updateStageAt = (idx, patch) => {
    const stages = song.stages.map((s, i) => (i === idx ? { ...s, ...patch } : s));
    onUpdate({ ...song, stages });
  };

  const removeStageAt = (idx) => onUpdate({ ...song, stages: song.stages.filter((_, i) => i !== idx) });
  const addStage = () => onUpdate({ ...song, stages: [...song.stages, { name: `Stage ${song.stages.length + 1}`, value: 0 }] });

  // Drag-and-drop handlers (T009-T013, T027-T031)
  const moveStage = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    const newStages = [...song.stages];
    const [movedStage] = newStages.splice(fromIndex, 1);
    newStages.splice(toIndex, 0, movedStage);
    onUpdate({ ...song, stages: newStages });
  };

  const handleDragStart = (e, index) => {
    e.stopPropagation(); // Prevent song card drag
    draggedIndexRef.current = index;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
    setIsDragging(true);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent song card drag
    if (draggedIndexRef.current === null) return;
    setDropTargetIndex(index);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent song card drag
    const fromIndex = draggedIndexRef.current;
    if (fromIndex !== null && fromIndex !== dropIndex) {
      moveStage(fromIndex, dropIndex);
    }
    draggedIndexRef.current = null;
    setDropTargetIndex(null);
    setIsDragging(false);
  };

  const handleDragCancel = () => {
    draggedIndexRef.current = null;
    setDropTargetIndex(null);
    setIsDragging(false);
  };

  const handleDragEnd = (e) => {
    e.stopPropagation(); // Prevent song card drag
    handleDragCancel();
  };

  const handleKeyDown = (e, index) => {
    // Cancel drag with Escape
    if (isDragging && e.key === 'Escape') {
      e.preventDefault();
      handleDragCancel();
      return;
    }

    // Keyboard reordering with Ctrl+Arrow keys (T036-T040, T042-T044)
    if (e.ctrlKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();

      if (e.key === 'ArrowUp' && index > 0) {
        // Move stage up one position
        moveStage(index, index - 1);
      } else if (e.key === 'ArrowDown' && index < song.stages.length - 1) {
        // Move stage down one position
        moveStage(index, index + 1);
      }
    }
  };

  // Touch handlers (T047-T049, T051)
  const handleTouchStart = (e, index) => {
    const touch = e.touches[0];
    initialTouchYRef.current = touch.clientY;

    // Start 500ms long-press timer
    touchTimerRef.current = setTimeout(() => {
      draggedIndexRef.current = index;
      setIsDragging(true);
    }, 500);
  };

  const handleTouchMove = (e) => {
    // Cancel timer if moving too early (scroll detected)
    if (!isDragging && touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
      return;
    }

    if (isDragging) {
      e.preventDefault();
      const touch = e.touches[0];
      // Find which stage the touch is over
      const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
      const stageElement = elements.find(el => el.getAttribute('data-stage-index'));
      if (stageElement) {
        const targetIndex = parseInt(stageElement.getAttribute('data-stage-index'));
        setDropTargetIndex(targetIndex);
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }

    if (isDragging) {
      const fromIndex = draggedIndexRef.current;
      if (fromIndex !== null && dropTargetIndex !== null && fromIndex !== dropTargetIndex) {
        moveStage(fromIndex, dropTargetIndex);
      }
      draggedIndexRef.current = null;
      setDropTargetIndex(null);
      setIsDragging(false);
    }

    initialTouchYRef.current = null;
  };

  const handleTempoLabelClick = () => {
    if (isEditingKey) {
      handleKeySave();
    }
    setIsEditingTempo(true);
  };

  const handleTempoChange = (e) => {
    setTempoInput(e.target.value);
  };

  const handleTempoSave = () => {
    const validated = validateTempo(tempoInput);
    const wasClamped = validated !== parseFloat(tempoInput);

    onUpdate({ ...song, tempo: validated });
    setTempoInput(validated.toString());
    setIsEditingTempo(false);

    if (wasClamped) {
      setShowTempoFeedback(true);
      setTimeout(() => setShowTempoFeedback(false), 500);
    }
  };

  const handleTempoCancel = () => {
    setTempoInput(song.tempo.toString());
    setIsEditingTempo(false);
  };

  const handleTempoKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTempoSave();
    } else if (e.key === 'Escape') {
      handleTempoCancel();
    }
  };

  const handleTempoBlur = () => {
    handleTempoSave();
  };

  const handleKeyLabelClick = () => {
    if (isEditingTempo) {
      handleTempoSave();
    }
    setIsEditingKey(true);
  };

  const handleNoteChange = (note) => {
    setTempKeyNote(note);
    if (!note) {
      setTempKeyMode(null);
    } else if (!tempKeyMode) {
      setTempKeyMode('Major');
    }
  };

  const handleModeChange = (mode) => {
    setTempKeyMode(mode);
  };

  const handleKeySave = () => {
    if (!tempKeyNote) {
      onUpdate({ ...song, key: null });
    } else {
      const normalized = normalizeNote(tempKeyNote, tempKeyMode || 'Major');
      onUpdate({ ...song, key: `${normalized} ${tempKeyMode || 'Major'}` });
    }
    setIsEditingKey(false);
  };

  const handleKeyCancel = () => {
    setTempKeyNote(selectedNote);
    setTempKeyMode(selectedMode);
    setIsEditingKey(false);
  };

  const handleKeyKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleKeySave();
    } else if (e.key === 'Escape') {
      handleKeyCancel();
    }
  };

  const handleKeyBlur = (e) => {
    // Check if focus is moving to another element within the container
    if (!e.currentTarget.contains(e.relatedTarget)) {
      handleKeySave();
    }
  };

  // Duration handlers
  const handleDurationLabelClick = () => {
    setTempMinutes(song.duration.minutes.toString());
    setTempSeconds(song.duration.seconds.toString());
    setIsEditingDuration(true);
  };

  const handleDurationSave = () => {
    const validated = validateDuration(
      parseInt(tempMinutes),
      parseInt(tempSeconds)
    );
    onUpdate({ ...song, duration: validated });
    setIsEditingDuration(false);
  };

  const handleDurationCancel = () => {
    setTempMinutes("");
    setTempSeconds("");
    setIsEditingDuration(false);
  };

  const handleDurationKeyDown = (e) => {
    if (e.key === 'Enter') handleDurationSave();
    else if (e.key === 'Escape') handleDurationCancel();
  };

  const handleDurationBlur = (e) => {
    // Check if focus is moving to another element within the container
    if (!e.currentTarget.contains(e.relatedTarget)) {
      handleDurationSave();
    }
  };

  // Sync tempoInput with song.tempo when song changes externally
  useEffect(() => {
    setTempoInput(song.tempo.toString());
  }, [song.tempo]);

  // Sync temp key values when song.key changes externally
  useEffect(() => {
    const [note, mode] = parseKey(song.key);
    setTempKeyNote(note);
    setTempKeyMode(mode);
  }, [song.key]);

  // Draft toggle handler
  const handleDraftToggle = (event) => {
    const newIsDraft = event.target.checked;
    onUpdate({ ...song, isDraft: newIsDraft });
  };

  return (
		   <div
		     className={`
		       bg-neutral-900 border border-neutral-800 rounded-2xl shadow-sm p-2 flex flex-col gap-2 h-[295px] w-[376px] relative
		       ${song.isDraft ? 'opacity-60' : ''}
		       ${isDraggingSong ? 'opacity-50' : ''}
		       ${isDropTargetSong ? 'border-t-2 border-amber-500' : ''}
		     `}
		     draggable={true}
		     onDragStart={(e) => onDragStart(e, index)}
		     onDragOver={(e) => onDragOver(e, index)}
		     onDrop={(e) => onDrop(e, index)}
		     onDragEnd={onDragEnd}
		   >
		  {/* Draft checkbox in top-right corner */}
		  <div className="absolute top-2 right-2 z-10">
		    <input
		      type="checkbox"
		      checked={song.isDraft || false}
		      onChange={handleDraftToggle}
		      className="w-4 h-4 cursor-pointer"
		      title="Mark as draft"
		    />
		  </div>
		  <div className="flex items-center justify-between gap-2">
			<EditableText
			  text={song.title}
			  onSubmit={(t) => onUpdate({ ...song, title: t })}
			  className="font-bold leading-tight text-xl tracking-wider"
			/>
			<button className="text-xs px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700" onClick={() => onZoom(song.id)} title="Zoom">Zoom</button>
		  </div>

		  {/* Overall song progress (derived) */}
		  <div className="relative">
			<ProgressBar value={avg} height="h-5" /> {/* slightly smaller bar */}
			<span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
			  {avg}%
			</span>
		  </div>

		  {/* Key and Tempo inputs */}
		  <div className="flex items-center gap-4 text-xs">
			{/* Key selection */}
			<div className="flex items-center gap-2">
			  <label className="text-neutral-400 cursor-pointer hover:underline" onClick={handleKeyLabelClick}>Key:</label>
			  {isEditingKey ? (
				<div className="flex gap-2" onBlur={handleKeyBlur}>
				  <select
					value={tempKeyNote || ''}
					onChange={(e) => handleNoteChange(e.target.value || null)}
					onKeyDown={handleKeyKeyDown}
					autoFocus
					className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
				  >
					<option value="">No Key</option>
					{NOTES.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
				  </select>
				  <select
					value={tempKeyMode || ''}
					onChange={(e) => handleModeChange(e.target.value)}
					onKeyDown={handleKeyKeyDown}
					disabled={!tempKeyNote}
					className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
				  >
					{MODES.map(m => <option key={m} value={m}>{m}</option>)}
				  </select>
				</div>
			  ) : (
				<span className="text-neutral-300">{song.key || 'No key'}</span>
			  )}
			</div>

			{/* Tempo */}
			<div className="flex items-center gap-2">
			  <label className="text-neutral-400 cursor-pointer hover:underline" onClick={handleTempoLabelClick}>Tempo:</label>
			  {isEditingTempo ? (
				<input
				  type="text"
				  value={tempoInput}
				  onChange={handleTempoChange}
				  onBlur={handleTempoBlur}
				  onKeyDown={handleTempoKeyDown}
				  autoFocus
				  className={`bg-neutral-800 border rounded px-2 py-1 w-16 text-center focus:outline-none focus:ring-1 focus:ring-amber-500 ${
					showTempoFeedback ? 'border-amber-500 animate-pulse' : 'border-neutral-700'
				  }`}
				  placeholder="120"
				/>
			  ) : (
				<span className="text-neutral-300">{song.tempo} BPM</span>
			  )}
			</div>

			{/* Duration */}
			<div className="flex items-center gap-2">
			  {!isEditingDuration ? (
				<>
				  <label
					className="text-neutral-400 cursor-pointer hover:underline"
					onClick={handleDurationLabelClick}
				  >
					Duration:
				  </label>
				  <span
					className="text-neutral-300 cursor-pointer"
					onClick={handleDurationLabelClick}
				  >
					{formatDuration(song.duration.minutes, song.duration.seconds)}
				  </span>
				</>
			  ) : (
				<>
				  <label className="text-neutral-400">Duration:</label>
				  <div className="flex gap-1 items-center" onBlur={handleDurationBlur}>
					<input
					  type="text"
					  value={tempMinutes}
					  onChange={(e) => setTempMinutes(e.target.value)}
					  onKeyDown={handleDurationKeyDown}
					  autoFocus
					  className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 w-12 text-center focus:outline-none focus:ring-1 focus:ring-amber-500"
					  placeholder="M"
					/>
					<span className="text-neutral-400">:</span>
					<input
					  type="text"
					  value={tempSeconds}
					  onChange={(e) => setTempSeconds(e.target.value)}
					  onKeyDown={handleDurationKeyDown}
					  className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 w-12 text-center focus:outline-none focus:ring-1 focus:ring-amber-500"
					  placeholder="SS"
					/>
				  </div>
				</>
			  )}
			</div>
		  </div>

		  <div className="flex-1 overflow-auto pr-1">
			<div className="flex flex-col gap-1"> {/* less vertical gap */}
			  {song.stages.map((stg, idx) => (
				<StageRow
				  key={`${stg.name}-${idx}`}
				  stage={stg}
				  onApply={(name, value) => updateStageAt(idx, { name, value })}
				  onRemove={() => removeStageAt(idx)}
				  draggable={true}
				  stageIndex={idx}
				  onDragStart={(e) => handleDragStart(e, idx)}
				  onDragOver={(e) => handleDragOver(e, idx)}
				  onDrop={(e) => handleDrop(e, idx)}
				  onDragEnd={handleDragEnd}
				  onKeyDown={(e) => handleKeyDown(e, idx)}
				  onTouchStart={(e) => handleTouchStart(e, idx)}
				  onTouchMove={handleTouchMove}
				  onTouchEnd={handleTouchEnd}
				  isDragging={isDragging && draggedIndexRef.current === idx}
				  isDropTarget={dropTargetIndex === idx}
				/>
			  ))}
			</div>
		  </div>

		  {/* footer shrunk */}
		  <div className="flex items-center justify-end pt-1">
			<button
			  className="w-3 h-3 flex items-center justify-center text-sm rounded bg-neutral-800 hover:bg-neutral-700"
			  onClick={addStage}
			>
			  +
			</button>
		  </div>
		</div>

  );
}

function SongDetail({ song, onUpdate, onBack }) {
  const avg = songAverage(song);
  const [tempoInput, setTempoInput] = useState(song.tempo.toString());
  const [showTempoFeedback, setShowTempoFeedback] = useState(false);
  const [isEditingTempo, setIsEditingTempo] = useState(false);
  const [isEditingKey, setIsEditingKey] = useState(false);

  const [selectedNote, selectedMode] = parseKey(song.key);
  const [tempKeyNote, setTempKeyNote] = useState(selectedNote);
  const [tempKeyMode, setTempKeyMode] = useState(selectedMode);

  // Duration edit state
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [tempMinutes, setTempMinutes] = useState("");
  const [tempSeconds, setTempSeconds] = useState("");

  // Drag-and-drop state (T021-T022, T046)
  const draggedIndexRef = useRef(null);
  const [dropTargetIndex, setDropTargetIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const touchTimerRef = useRef(null);
  const initialTouchYRef = useRef(null);

  const updateStageAt = (idx, patch) => {
    const stages = song.stages.map((s, i) => (i === idx ? { ...s, ...patch } : s));
    onUpdate({ ...song, stages });
  };

  const removeStageAt = (idx) => onUpdate({ ...song, stages: song.stages.filter((_, i) => i !== idx) });
  const addStage = () => onUpdate({ ...song, stages: [...song.stages, { name: `Stage ${song.stages.length + 1}`, value: 0 }] });

  // Drag-and-drop handlers (T023-T024, T032-T034) - Mirror SongCard
  const moveStage = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    const newStages = [...song.stages];
    const [movedStage] = newStages.splice(fromIndex, 1);
    newStages.splice(toIndex, 0, movedStage);
    onUpdate({ ...song, stages: newStages });
  };

  const handleDragStart = (e, index) => {
    draggedIndexRef.current = index;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
    setIsDragging(true);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndexRef.current === null) return;
    setDropTargetIndex(index);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const fromIndex = draggedIndexRef.current;
    if (fromIndex !== null && fromIndex !== dropIndex) {
      moveStage(fromIndex, dropIndex);
    }
    draggedIndexRef.current = null;
    setDropTargetIndex(null);
    setIsDragging(false);
  };

  const handleDragCancel = () => {
    draggedIndexRef.current = null;
    setDropTargetIndex(null);
    setIsDragging(false);
  };

  const handleDragEnd = () => {
    handleDragCancel();
  };

  const handleKeyDown = (e, index) => {
    // Cancel drag with Escape
    if (isDragging && e.key === 'Escape') {
      e.preventDefault();
      handleDragCancel();
      return;
    }

    // Keyboard reordering with Ctrl+Arrow keys (T036-T040, T042-T044)
    if (e.ctrlKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();

      if (e.key === 'ArrowUp' && index > 0) {
        // Move stage up one position
        moveStage(index, index - 1);
      } else if (e.key === 'ArrowDown' && index < song.stages.length - 1) {
        // Move stage down one position
        moveStage(index, index + 1);
      }
    }
  };

  // Touch handlers (T047-T049, T051)
  const handleTouchStart = (e, index) => {
    const touch = e.touches[0];
    initialTouchYRef.current = touch.clientY;

    // Start 500ms long-press timer
    touchTimerRef.current = setTimeout(() => {
      draggedIndexRef.current = index;
      setIsDragging(true);
    }, 500);
  };

  const handleTouchMove = (e) => {
    // Cancel timer if moving too early (scroll detected)
    if (!isDragging && touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
      return;
    }

    if (isDragging) {
      e.preventDefault();
      const touch = e.touches[0];
      // Find which stage the touch is over
      const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
      const stageElement = elements.find(el => el.getAttribute('data-stage-index'));
      if (stageElement) {
        const targetIndex = parseInt(stageElement.getAttribute('data-stage-index'));
        setDropTargetIndex(targetIndex);
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }

    if (isDragging) {
      const fromIndex = draggedIndexRef.current;
      if (fromIndex !== null && dropTargetIndex !== null && fromIndex !== dropTargetIndex) {
        moveStage(fromIndex, dropTargetIndex);
      }
      draggedIndexRef.current = null;
      setDropTargetIndex(null);
      setIsDragging(false);
    }

    initialTouchYRef.current = null;
  };

  const handleTempoLabelClick = () => {
    if (isEditingKey) {
      handleKeySave();
    }
    setIsEditingTempo(true);
  };

  const handleTempoChange = (e) => {
    setTempoInput(e.target.value);
  };

  const handleTempoSave = () => {
    const validated = validateTempo(tempoInput);
    const wasClamped = validated !== parseFloat(tempoInput);

    onUpdate({ ...song, tempo: validated });
    setTempoInput(validated.toString());
    setIsEditingTempo(false);

    if (wasClamped) {
      setShowTempoFeedback(true);
      setTimeout(() => setShowTempoFeedback(false), 500);
    }
  };

  const handleTempoCancel = () => {
    setTempoInput(song.tempo.toString());
    setIsEditingTempo(false);
  };

  const handleTempoKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTempoSave();
    } else if (e.key === 'Escape') {
      handleTempoCancel();
    }
  };

  const handleTempoBlur = () => {
    handleTempoSave();
  };

  const handleKeyLabelClick = () => {
    if (isEditingTempo) {
      handleTempoSave();
    }
    setIsEditingKey(true);
  };

  const handleNoteChange = (note) => {
    setTempKeyNote(note);
    if (!note) {
      setTempKeyMode(null);
    } else if (!tempKeyMode) {
      setTempKeyMode('Major');
    }
  };

  const handleModeChange = (mode) => {
    setTempKeyMode(mode);
  };

  const handleKeySave = () => {
    if (!tempKeyNote) {
      onUpdate({ ...song, key: null });
    } else {
      const normalized = normalizeNote(tempKeyNote, tempKeyMode || 'Major');
      onUpdate({ ...song, key: `${normalized} ${tempKeyMode || 'Major'}` });
    }
    setIsEditingKey(false);
  };

  const handleKeyCancel = () => {
    setTempKeyNote(selectedNote);
    setTempKeyMode(selectedMode);
    setIsEditingKey(false);
  };

  const handleKeyKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleKeySave();
    } else if (e.key === 'Escape') {
      handleKeyCancel();
    }
  };

  const handleKeyBlur = (e) => {
    // Check if focus is moving to another element within the container
    if (!e.currentTarget.contains(e.relatedTarget)) {
      handleKeySave();
    }
  };

  // Duration handlers
  const handleDurationLabelClick = () => {
    setTempMinutes(song.duration.minutes.toString());
    setTempSeconds(song.duration.seconds.toString());
    setIsEditingDuration(true);
  };

  const handleDurationSave = () => {
    const validated = validateDuration(
      parseInt(tempMinutes),
      parseInt(tempSeconds)
    );
    onUpdate({ ...song, duration: validated });
    setIsEditingDuration(false);
  };

  const handleDurationCancel = () => {
    setTempMinutes("");
    setTempSeconds("");
    setIsEditingDuration(false);
  };

  const handleDurationKeyDown = (e) => {
    if (e.key === 'Enter') handleDurationSave();
    else if (e.key === 'Escape') handleDurationCancel();
  };

  const handleDurationBlur = (e) => {
    // Check if focus is moving to another element within the container
    if (!e.currentTarget.contains(e.relatedTarget)) {
      handleDurationSave();
    }
  };

  useEffect(() => {
    setTempoInput(song.tempo.toString());
  }, [song.tempo]);

  useEffect(() => {
    const [note, mode] = parseKey(song.key);
    setTempKeyNote(note);
    setTempKeyMode(mode);
  }, [song.key]);

  // Draft toggle handler
  const handleDraftToggle = (event) => {
    const newIsDraft = event.target.checked;
    onUpdate({ ...song, isDraft: newIsDraft });
  };

  return (
	  <div className="h-screen w-screen bg-black flex items-center justify-center">
		<div
		  className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-lg flex flex-col"
		  style={{ width: 740, height: 724 }}  // keep your chosen size
		>
		  <div className="flex items-center justify-between mb-4">
			<EditableText
			  text={song.title}
			  onSubmit={(t) => onUpdate({ ...song, title: t })}
			  className="text-3xl font-bold"
			/>
			<div className="flex items-center gap-2">
			  <label className="flex items-center gap-1 text-sm">
			    <input
			      type="checkbox"
			      checked={song.isDraft || false}
			      onChange={handleDraftToggle}
			      className="w-4 h-4 cursor-pointer"
			    />
			    <span>Draft</span>
			  </label>
			  <button className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700" onClick={onBack}>
			    Back to Grid
			  </button>
			</div>
		  </div>

		  <div className="relative mb-3">
			<ProgressBar value={avg} height="h-9" />
			<span className="absolute inset-0 flex items-center justify-center text-white font-bold">
			  {avg}%
			</span>
		  </div>

		  {/* Key and Tempo inputs */}
		  <div className="flex items-center gap-6 mb-3">
			{/* Key selection */}
			<div className="flex items-center gap-3">
			  <label className="text-neutral-400 cursor-pointer hover:underline" onClick={handleKeyLabelClick}>Key:</label>
			  {isEditingKey ? (
				<div className="flex gap-3" onBlur={handleKeyBlur}>
				  <select
					value={tempKeyNote || ''}
					onChange={(e) => handleNoteChange(e.target.value || null)}
					onKeyDown={handleKeyKeyDown}
					autoFocus
					className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
				  >
					<option value="">No Key</option>
					{NOTES.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
				  </select>
				  <select
					value={tempKeyMode || ''}
					onChange={(e) => handleModeChange(e.target.value)}
					onKeyDown={handleKeyKeyDown}
					disabled={!tempKeyNote}
					className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
				  >
					{MODES.map(m => <option key={m} value={m}>{m}</option>)}
				  </select>
				</div>
			  ) : (
				<span className="text-neutral-300 font-bold">{song.key || 'No key'}</span>
			  )}
			</div>

			{/* Tempo */}
			<div className="flex items-center gap-3">
			  <label className="text-neutral-400 cursor-pointer hover:underline" onClick={handleTempoLabelClick}>Tempo:</label>
			  {isEditingTempo ? (
				<input
				  type="text"
				  value={tempoInput}
				  onChange={handleTempoChange}
				  onBlur={handleTempoBlur}
				  onKeyDown={handleTempoKeyDown}
				  autoFocus
				  className={`bg-neutral-800 border rounded px-3 py-2 w-24 text-center focus:outline-none focus:ring-1 focus:ring-amber-500 ${
					showTempoFeedback ? 'border-amber-500 animate-pulse' : 'border-neutral-700'
				  }`}
				  placeholder="120"
				/>
			  ) : (
				<span className="text-neutral-300 font-bold">{song.tempo} BPM</span>
			  )}
			</div>

			{/* Duration */}
			<div className="flex items-center gap-3">
			  {!isEditingDuration ? (
				<>
				  <label
					className="text-neutral-400 cursor-pointer hover:underline"
					onClick={handleDurationLabelClick}
				  >
					Duration:
				  </label>
				  <span
					className="text-neutral-300 font-bold cursor-pointer"
					onClick={handleDurationLabelClick}
				  >
					{formatDuration(song.duration.minutes, song.duration.seconds)}
				  </span>
				</>
			  ) : (
				<>
				  <label className="text-neutral-400">Duration:</label>
				  <div className="flex gap-1 items-center" onBlur={handleDurationBlur}>
					<input
					  type="text"
					  value={tempMinutes}
					  onChange={(e) => setTempMinutes(e.target.value)}
					  onKeyDown={handleDurationKeyDown}
					  autoFocus
					  className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 w-16 text-center focus:outline-none focus:ring-1 focus:ring-amber-500"
					  placeholder="M"
					/>
					<span className="text-neutral-400">:</span>
					<input
					  type="text"
					  value={tempSeconds}
					  onChange={(e) => setTempSeconds(e.target.value)}
					  onKeyDown={handleDurationKeyDown}
					  className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 w-16 text-center focus:outline-none focus:ring-1 focus:ring-amber-500"
					  placeholder="SS"
					/>
				  </div>
				</>
			  )}
			</div>
		  </div>

		  {/* make this fill remaining space; no fixed height */}
		  <div className="flex-1 overflow-auto pr-1">
			<div className="flex flex-col gap-3">
			  {song.stages.map((stg, idx) => (
				  <StageRow
					key={`${stg.name}-${idx}`}
					stage={stg}
					onApply={(name, value) => updateStageAt(idx, { name, value })}
					onRemove={() => removeStageAt(idx)}
					stageRowHeight = "h-8"
					draggable={true}
					stageIndex={idx}
					onDragStart={(e) => handleDragStart(e, idx)}
					onDragOver={(e) => handleDragOver(e, idx)}
					onDrop={(e) => handleDrop(e, idx)}
					onDragEnd={handleDragEnd}
					onKeyDown={(e) => handleKeyDown(e, idx)}
					onTouchStart={(e) => handleTouchStart(e, idx)}
					onTouchMove={handleTouchMove}
					onTouchEnd={handleTouchEnd}
					isDragging={isDragging && draggedIndexRef.current === idx}
					isDropTarget={dropTargetIndex === idx}
				  />
				))}
			</div>
		  </div>

		  <div className="pt-3 flex items-center justify-between">
			<button
			  className="w-9 h-9 flex items-center justify-center text-lg rounded bg-neutral-800 hover:bg-neutral-700"
			  onClick={addStage}
			>
			  +
			</button>
		  </div>
		</div>
	  </div>
	);
}

function toLocalDatetimeInputValue(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function fromLocalDatetimeInputValue(value) {
  const d = new Date(value);
  return d.toISOString();
}

export default function App() {
  const stored = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  }, []);

  // Migrate older storage shapes
  const migrateSongs = (s) => {
    if (!s) return DEFAULT_SONGS;

    const migratedSongs = s.map((song, index) => {
      let migratedStages = song.stages;

      // Migrate stages format
      if (Array.isArray(song.stages)) {
        migratedStages = song.stages; // v2+
      } else if (song.stages && typeof song.stages === "object") {
        const entries = Object.entries(song.stages).map(([name, value]) => ({ name, value: Number(value) || 0 }));
        migratedStages = entries;
      } else {
        migratedStages = DEFAULT_STAGE_NAMES.map((n) => ({ name: n, value: 0 }));
      }

      // Migrate tempo (add default if missing or invalid)
      const tempo = (typeof song.tempo === 'number' && song.tempo >= 30 && song.tempo <= 300)
        ? song.tempo
        : DEFAULT_TEMPO;

      // Migrate key (add default if missing or invalid)
      const key = (typeof song.key === 'string' && song.key.trim() !== '')
        ? song.key
        : null;

      // Migrate duration (add default if missing)
      const duration = (song.duration && typeof song.duration.minutes === 'number' && typeof song.duration.seconds === 'number')
        ? song.duration
        : { minutes: 0, seconds: 0 };

      return { ...song, stages: migratedStages, tempo, key, duration };
    });

    // Fix duplicate IDs - reassign sequential IDs if duplicates found
    const ids = migratedSongs.map(s => s.id);
    const hasDuplicates = ids.some((id, index) => ids.indexOf(id) !== index);

    if (hasDuplicates) {
      console.warn('Duplicate song IDs detected, reassigning unique IDs');
      return migratedSongs.map((song, index) => ({ ...song, id: index + 1 }));
    }

    return migratedSongs;
  };

  const [songs, setSongs] = useState(() => migrateSongs(stored.songs) || DEFAULT_SONGS);
  const [albumTitle, setAlbumTitle] = useState(() => stored.albumTitle || "Album Dashboard");
  const [targetISO, setTargetISO] = useState(() => stored.targetISO || new Date("2026-08-01T00:00:00").toISOString());

  // Drag state for song reordering
  const [draggedSongIndex, setDraggedSongIndex] = useState(null);
  const [dropTargetSongIndex, setDropTargetSongIndex] = useState(null);

  const hash = useHashRoute();
  const songIdFromHash = useMemo(() => {
    if (hash && hash.startsWith("#song/")) {
      const num = Number(hash.slice(6));
      return Number.isFinite(num) ? num : null;
    }
    return null;
  }, [hash]);

  const currentSong = songIdFromHash ? songs.find((s) => s.id === songIdFromHash) : null;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ songs, targetISO, albumTitle }));
  }, [songs, targetISO, albumTitle]);

  const updateSong = (updated) => setSongs((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));

  // Drag handlers for song reordering
  const handleSongDragStart = (event, index) => {
    setDraggedSongIndex(index);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', index.toString());
  };

  const handleSongDragOver = (event, index) => {
    event.preventDefault(); // Required to enable drop
    setDropTargetSongIndex(index);
  };

  const handleSongDrop = (event, targetIndex) => {
    event.preventDefault();

    // Validation checks
    if (draggedSongIndex === null) return; // Invalid state
    if (draggedSongIndex === targetIndex) return; // No-op (same position)

    // Immutable array reordering
    const newSongs = [...songs];
    const [draggedSong] = newSongs.splice(draggedSongIndex, 1);
    newSongs.splice(targetIndex, 0, draggedSong);

    // Update state (triggers localStorage persistence via useEffect)
    setSongs(newSongs);

    // Reset drag state
    setDraggedSongIndex(null);
    setDropTargetSongIndex(null);
  };

  const handleSongDragEnd = () => {
    setDraggedSongIndex(null);
    setDropTargetSongIndex(null);
  };

  // Escape key handler to cancel drag
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && draggedSongIndex !== null) {
        setDraggedSongIndex(null);
        setDropTargetSongIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [draggedSongIndex]);

	  useEffect(() => {
		document.title = "SPINNING LIGHTS";
	  }, [albumTitle]);
	  
  return (
    <div className="h-screen w-full overflow-hidden bg-neutral-950 text-neutral-100">
      

      {currentSong ? (
		  <SongDetail
			song={currentSong}
			onUpdate={updateSong}
			onBack={() => (window.location.hash = "")}
		  />
		) : (
		  <>
			<Header
			  targetISO={targetISO}
			  setTargetISO={setTargetISO}
			  songs={songs}
			  albumTitle={albumTitle}
			  setAlbumTitle={setAlbumTitle}
			/>

			{/* Album-wide overall progress (with % in center) */}
			<div className="px-4 -mt-2 pb-2 relative">
			  <ProgressBar value={albumAverage(songs)} height="h-9" />
			  <span
				className="absolute inset-0 text-white font-bold"
				style={{
				  lineHeight: "36px", // match h-9 (36px)
				  textAlign: "center",
				}}
			  >
				{albumAverage(songs)}%
			  </span>
			</div>

			<div className="px-4 pb-4 h-[calc(100vh-140px)] overflow-hidden">
			  <div className="grid grid-cols-5 gap-1 justify-items-center">
				{songs.map((song, index) => (
				  <SongCard
					key={song.id}
					song={song}
					index={index}
					onUpdate={updateSong}
					onZoom={(id) => (window.location.hash = `#song/${id}`)}
					onDragStart={handleSongDragStart}
					onDragOver={handleSongDragOver}
					onDrop={handleSongDrop}
					onDragEnd={handleSongDragEnd}
					isDraggingSong={draggedSongIndex === index}
					isDropTargetSong={dropTargetSongIndex === index}
				  />
				))}
			  </div>
			</div>
		  </>
		)}
    </div>
  );
}
