import React, { useEffect, useMemo, useRef } from "react";
import YouTube from "react-youtube";
import { useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { addNote, deleteNote } from "../RTK/feature/noteBookSlice.js";

function Notes() {
  // useState
  const [player, setPlayer] = useState(null);
  const [isBtnDisable, setIsBtnDisable] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [seconds, setSeconds] = useState(0);

  // useRef
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  // use uselocation. cant use in useMemo
  const location = useLocation();

  // use useDispatch()
  const dispatch = useDispatch();

  // use useMemo to avoid recalculating at each render.
  const sentData = useMemo(() => location.state, []);

  // use useSelector to access the state
  const noteBookArr = useSelector((state) => state.notebook.noteBookArr);

  // useMemo to avoid unnecesary recreation
  const currentObj = useMemo(
    () => noteBookArr.find((obj) => obj.id == sentData.id),
    [noteBookArr]
  );

  // youtube video object
  const opts = {
    height: "480",
    width: "100%",
    playerVars: {
      autoplay: 0,
      controls: 1,
    },
  };

  // function for youtube video ready
  const onPlayerReady = (event) => {
    event.target.playVideo();
    setPlayer(event.target);
  };

  // function for delete btn
  const handleDeleteNote = (noteId, event) => {
    // prevent event bubbling
    event.stopPropagation();

    // dispatch action
    dispatch(deleteNote({ id: currentObj.id, noteId }));
  };

  // useEffect for seconds
  useEffect(() => {
    if (seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;

      // use padStart to format. very important method
      setCurrentTime(
        `${String(minutes).padStart(2, "0")}:${String(
          remainingSeconds
        ).padStart(2, "0")}`
      );
    }
  }, [seconds]);

  // function to handle create time stamp button
  const handleCreateTimeStampBtn = () => {
    // clear title and note area
    inputRef.current.value = "";
    textareaRef.current.value = "";

    // check if player loaded fully
    if (player) {
      // pause video
      player.pauseVideo();

      // disble button
      setIsBtnDisable(true);

      // get the current time and store
      setSeconds(Math.trunc(player.getCurrentTime()));
    }
  };

  // handle save btn click
  const handleSaveBtn = () => {
    if (inputRef.current.value == "" || textareaRef.current.value == "") {
      alert("Please fill the fields...");
      return;
    } else {
      // create new note object
      const noteObj = {
        noteId: Date.now(),
        noteTitle: inputRef.current.value,
        content: textareaRef.current.value,
        timeStamp: seconds,
        formatedTime: currentTime,
      };

      //dispatch action to update array

      dispatch(addNote({ id: currentObj.id, noteObj }));

      // clear fields
      inputRef.current.value = "";
      textareaRef.current.value = "";

      // disable save btn
      setIsBtnDisable(false);
    }
  };

  // to render the previous notes
  const handleNoteBoxClick = (obj) => {
    inputRef.current.value = obj.noteTitle;
    textareaRef.current.value = obj.content;
    player.seekTo(obj.timeStamp, true);
  };
  return (
    <>
      {/* main container */}
      <div className="md:h-screen w-full bg-transparent">
        {/* grid container */}
        <div className="h-full w-full bg-transparent flex flex-col md:grid md:grid-cols-[1.5fr_1fr]">
          {/* first grid column or first flex item*/}
          <div className="bg-transparent p-3">
            <div className="rounded-xl overflow-hidden">
              <YouTube
                videoId={sentData.id}
                opts={opts}
                onReady={onPlayerReady}
              />
            </div>

            <h1 className="text-2xl font-semibold mt-2 text-slate-300">
              {sentData.title}
            </h1>
            {/* div for buttons */}
            <div className="text-white p-2 flex flex-row-reverse gap-8">
              <button
                onClick={handleCreateTimeStampBtn}
                disabled={isBtnDisable}
                className={`px-3 py-2 text-xl bg-[#0D00A4] transition duration-150  rounded-lg  outline-none ${
                  isBtnDisable
                    ? "cursor-not-allowed font-bold"
                    : "active:bg-[#22007C] cursor-pointer"
                }`}
              >
                {isBtnDisable
                  ? `Current Time Stamp : ${currentTime}`
                  : "Create time stamp"}
              </button>
              <button
                onClick={handleSaveBtn}
                disabled={!isBtnDisable}
                className={`px-3 py-2 text-xl bg-[#0D00A4] transition duration-150  rounded-lg outline-none ${
                  !isBtnDisable
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer active:bg-[#22007C]"
                }`}
              >
                Save
              </button>
            </div>
          </div>
          {/* second grid column or second flex-item */}
          <div className="bg-transparent md:h-screen pr-3 pl-3 flex flex-col md:pl-0 md:pr-3 md:overflow-y-auto scroll-smooth no-scrollbar">
            {/* input tag for title  */}
            <input
              spellCheck="false"
              autoCorrect="off"
              autoCapitalize="none"
              autoComplete="off"
              ref={inputRef}
              disabled={!isBtnDisable}
              type="text"
              placeholder="Note title"
              className="bg-[#02010A] w-full border-x-2 border-y-2 border-slate-300  text-xl px-3 outline-none py-2 mt-3 text-white shrink-0 rounded-t-lg"
            />

            {/* note area */}
            <textarea
              ref={textareaRef}
              disabled={!isBtnDisable}
              spellCheck="false"
              autoCorrect="off"
              autoCapitalize="none"
              autoComplete="off"
              placeholder="Create time stamp to start writing notes..."
              className="h-[434px] w-full text-xl resize-none p-3 outline-none bg-[#02010A] shrink-0 scroll-smooth rounded-b-lg border-x-2 border-b-2 border-slate-300 text-slate-100"
            ></textarea>

            {/* title for previous notes */}
            <h1 className="text-center bg-transparent pt-2 text-slate-200 text-2xl font-semibold">
              {currentObj.notes.length == 0 ? "" : "Note Section"}
            </h1>
            {/* notes Container */}
            <div className="w-full rounded-2xl flex flex-col bg-transparent pb-3">
              {/* each note box */}
              {currentObj.notes.length == 0 ? (
                <p className="text-center text-xl font-semibold text-slate-400 mt-14">
                  📝 No notes yet, add one
                </p>
              ) : (
                currentObj.notes.map((obj) => (
                  <div
                    key={obj.noteId}
                    onClick={() => handleNoteBoxClick(obj)}
                    className="bg-black flex mx-2 mt-3 rounded-lg p-3 shadow-md drop-shadow-[0_4px_6px_rgba(255,255,255,0.15)] border-[1px] text-slate-300"
                  >
                    {/* first flex item */}
                    <div className="flex flex-grow items-center space-x-4  cursor-pointer">
                      {/* time stamp */}
                      <div className="bg-[#140152] px-3 py-1 rounded-md text-sm font-medium">
                        {obj.formatedTime}
                      </div>
                      {/* title */}
                      <div className="text-lg font-semibold">
                        {obj.noteTitle}
                      </div>
                    </div>

                    {/* second flex item */}
                    <button
                      onClick={(event) => handleDeleteNote(obj.noteId, event)}
                      className="ml-3 p-2 cursor-pointer bg-transparent rounded-md hover:bg-[#22007C] transition duration-150  text-xl"
                    >
                      <RiDeleteBin6Line />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Notes;
