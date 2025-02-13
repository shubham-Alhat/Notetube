import React, { useRef, useState } from "react";
import { MdOutlineFileUpload } from "react-icons/md";
import conf from "../conf/conf";
import getVideoId from "get-video-id";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useSelector, useDispatch } from "react-redux";
import { addNoteBook, deleteNoteBook } from "../RTK/feature/noteBookSlice";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";

function Home() {
  // create ref for input field
  const inputRef = useRef(null);
  // create ref for error box
  const errorBoxRef = useRef(null);

  // use useState for loading
  const [isLoading, setIsLoading] = useState(false);

  // access the redux initial state
  const noteBookArr = useSelector((state) => state.notebook.noteBookArr);

  // create dispatch method
  const dispatch = useDispatch();

  // create navigate method
  const navigate = useNavigate();

  // display error box function
  const showError = (message) => {
    // set loading to false
    setIsLoading(false);

    // make error div visible
    errorBoxRef.current.classList.remove("hidden");

    // message rendering
    errorBoxRef.current.children[1].innerText = message;

    // clear input field
    inputRef.current.value = "";

    // remove error box after3 seconds
    setTimeout(() => {
      if (errorBoxRef.current) {
        errorBoxRef.current.classList.add("hidden");
      }
    }, 4000);
  };

  // create a function to fetch video data
  const fetchData = async (id) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics,status&id=${id}&key=${conf.apiKey}`
      );
      const data = await response.json();

      // check if data is valid.
      if (data.items.length === 0) {
        showError("Invalid URL\n Please enter valid URL");
        return;
      }

      // check embeddable status and handle it
      if (!data.items[0].status.embeddable) {
        showError("Youtube policy prevents this video from being embedded");
        return;
      }

      // we got data.
      // loop through redux state i.e noteBookArr to check whether it exist or not
      const isFoundObj = noteBookArr.find((obj) => obj.id == data.items[0].id);
      if (isFoundObj) {
        // set loading false
        setIsLoading(false);

        // clear input field
        inputRef.current.value = "";
        // navigate with that existing object
        navigate("/notebook", { state: isFoundObj });
        // return
        return;
      } else {
        // create a new video object
        const newVideoObj = {
          id: data.items[0].id,
          title: data.items[0].snippet.title,
          thumbnail: data.items[0].snippet.thumbnails.high.url,
          notes: [],
        };
        // add this object in redux state using reducer.
        dispatch(addNoteBook(newVideoObj));

        // set loading false
        setIsLoading(false);

        // clear input fields
        inputRef.current.value = "";

        // navigate with new object
        navigate("/notebook", { state: newVideoObj });
        // return
        return;
      }
    } catch (error) {
      // set loading false
      setIsLoading(false);
      alert("ERROR :: while fetching :", error.message);
    }
  };
  // on form submit function
  const handleSubmit = (e) => {
    e.preventDefault();

    // set loading true.
    setIsLoading(true);

    // get video id from url
    const videoIdObject = getVideoId(inputRef.current.value);

    // check for invalid urls and handle it
    if (!videoIdObject.id) {
      showError("Invalid URL\n Please enter valid URL");
      return;
    }

    // call function to start fetching data
    fetchData(videoIdObject.id);
  };

  // function to delete video notebok
  const handleDeleteBtn = (e, id) => {
    // prevent event bubbling
    e.stopPropagation();

    // i.e dispatch deleteNoteBook()
    dispatch(deleteNoteBook(id));
  };

  // handle click on history
  const handleHistoryClick = (obj) => {
    navigate("/notebook", { state: obj });
  };

  return (
    <>
      <div className="min-h-screen flex flex-col bg-transparent justify-center items-center text-slate-300">
        {/* heading */}
        <h1 className="text-xl font-bold text-center px-2 sm:text-2xl md:text-3xl mb-24">
          Take <span className=" border-b-2 text-white">Notes</span> directly on
          your <span className="text-white">Videos</span>
        </h1>

        {/* div which contains form */}
        <div className="max-w-3xl w-full mt-3 border-2 border-[#adb5bd] rounded-xl overflow-hidden">
          <form
            action="#"
            className="flex items-center bg-transparent"
            onSubmit={handleSubmit}
          >
            <input
              spellCheck="false"
              autoCorrect="off"
              autoCapitalize="none"
              autoComplete="off"
              type="text"
              required
              ref={inputRef}
              placeholder="Video URL"
              className="flex-grow px-5 py-3 outline-none bg-transparent "
            />
            <button
              type="submit"
              className="py-3 px-3 cursor-pointer bg-transparent hover:bg-[#140152] transition duration-150"
            >
              {isLoading ? (
                <Loader />
              ) : (
                <MdOutlineFileUpload className="text-2xl" />
              )}
            </button>
          </form>
        </div>

        {/* error box */}
        <div id="errorBox" ref={errorBoxRef} className="relative mt-3 hidden">
          {/* traingle */}
          <div className=" w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[15px] border-b-[#c71f37] absolute left-6 -top-3"></div>
          {/* message */}
          <div
            id="error-message"
            className="p-1 w-48 bg-[#c71f37] text-white font-normal text-center rounded-md"
          ></div>
        </div>

        {/* history box */}
        <div className="max-w-3xl w-full p-3 mt-12 flex gap-3 overflow-x-auto no-scrollbar scroll-smooth px-3 bg-transparent">
          {/* each video-box */}
          {noteBookArr.length == 0 ? (
            <p className="text-xl text-center font-semibold text-slate-300 w-full">
              No watch history yet
            </p>
          ) : (
            noteBookArr.map((obj) => (
              <div
                key={obj.id}
                onClick={() => handleHistoryClick(obj)}
                className="flex-shrink-0 w-56 pt-9 px-2 rounded-lg  bg-gradient-to-b from-[#04052E] to-[#140152] text-white relative cursor-pointer hover:opacity-85 duration-200"
              >
                <button
                  onClick={(e) => handleDeleteBtn(e, obj.id)}
                  className="absolute right-0 top-0 text-xl mr-2 mt-2 cursor-pointer text-gray-300 hover:text-white hover:scale-125 duration-200"
                >
                  <RiDeleteBin6Line />
                </button>
                <img
                  src={obj.thumbnail}
                  alt="thumbnail"
                  className="w-full rounded-lg"
                />
                <h1 className="w-full truncate p-1">{obj.title}</h1>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default Home;
