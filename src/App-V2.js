import { useEffect, useRef, useState } from "react";
import StarRating from './StarRating';

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

  const KEY = "8d5404ba";

export default function App() {

   const [query, setQuery] = useState("");
  const [picture, setPicture] = useState([]);
   const[isLoding,setIsLoding]=useState(false);
  const[error,setError]=useState("");
  const[selectedid,setSelectedId]=useState(null);

  //const [watched, setWatched] = useState([]);
  const [watched, setWatched] = useState(
    function()
    {
      const storedValue = localStorage.getItem("watched");
      return JSON.parse(storedValue);
    }
  );

   function handalSelectMovie(id)
   {
            
    setSelectedId((selectedId) => (id === selectedId ? null : id));
   }
   function handalCloseMovie()
   {
    setSelectedId(null);
   }
  function handalAddWatchedList(movie)
  {
    setWatched((watched)=>[...watched,movie]);

  }
  function handalDeleteWatched(id)
  {
    setWatched((watched)=> watched.filter((movie)=>movie.imdbID !== id));
  }  

  useEffect(
    function()
    {
      localStorage.setItem("watched",JSON.stringify(watched));
    },[watched]
  );
  

    useEffect(
      function()
      {
          const controller = new AbortController();
    async function fetchmovies()
    {
      try{
        setIsLoding(true);
        setError("");
        const res= await fetch(`http://www.omdbapi.com/?i=tt3896198&apikey=${KEY}&s=${query}`,
        { signal: controller.signal }
        );

        if(!res.ok)
           throw new Error("Something went to Wrong with fetching data ");         
        
          const data= await res.json();
        if(data.Response === "False" ) 
             throw new Error ("Movie Not Found");
        setPicture(data.Search);
        setError("");
               
      }
     catch(err){
      if(err.name !== "AbortError")
      {
        setError(err.message);
      }

    }
     finally{
      setIsLoding(false);
     }
      
    }
    if(query.length <3 )
    {
      setPicture([]);
      setError("");
      return;
    }
    handalCloseMovie();
     fetchmovies();  
     
     return function()
     {
      controller.abort();
     };
  },
  [query]);   

  return (
    <>
      <NavBar>
        <Search  query={query} setQuery={setQuery} />
        <NumResults movies={picture} />
      </NavBar>

      <Main>
        <Box>
          {/*{isloding ? <Loding/> :<MovieList movies={picture} />}*/}
          {isLoding && <Loding/>}
          {!isLoding && !error && (
                <MovieList movies={picture} onSelectMovie={handalSelectMovie}/>)}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>            
              {selectedid  ?( 
              <MoviDetails 
              selectedid={selectedid}
              onclosemovie={handalCloseMovie}
              onAddWatched={handalAddWatchedList}
              watched={watched}/>
              ):(
              
              <>
            <WatchedSummary watched={watched} />
          <WatchedMoviesList
               watched={watched}
            ondeleteWatch={handalDeleteWatched} />
          </>
          )}          
        </Box>
      </Main>
    </>
  );
}
function Loding()
{
  return(
    <p className="loader">Loding.......</p>
  );
}
function ErrorMessage({message})
{
  return(
    <p className="error">
       <span>⛔️</span> {message}
    </p>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({query,setQuery}) {

  const  inputEl = useRef(null);

  useEffect (
    function() {
     function Callback(e)
     {
      if(document.activeElement === inputEl.current) return;
      if(e.code === "Enter")
      {
        inputEl.current.focus();
        setQuery("");
      }
     }
     document.addEventListener("keydown",Callback);
     return()=> document.addEventListener("keydown",Callback);
    
  },[setQuery])
 /* useEffect(function()
  {
    const el = document.querySelector("search");
    console.log(el);
    el.focus();

  },[])*/
  

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
     ref={inputEl}
    />
  );
}

function NumResults({movies}) {
  return (
    <p className="num-results">
     
      Found<strong> {movies.length} </strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>

      {isOpen && children}
    </div>
  );
}

function MovieList({ movies,onSelectMovie}) {
  //console.log("MovieList --->",movies)
  return (
    <ul className="list list-movies">
      
      {movies?.map((movies) => (
        <Movie movie={movies} key={movies.imdbID} onSelectMovie={onSelectMovie}/>
      ))}
    </ul>
  );
}

function Movie({ movie,onSelectMovie}) {
 //console.log("Movies --->",movie)
 
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MoviDetails({selectedid,onclosemovie,onAddWatched,watched})
{
  const[movie,setMovie]=useState({});
  const[isLoading,setIsLoading]=useState(false)
  const[userRating,setUserRating]=useState()

const countRef =useRef(0);
  useEffect(function()
  {
    if(userRating) countRef.current++;
  },[userRating]);
  const IsWached = watched.map((movie)=>movie.imdbID).includes(selectedid);
  const watchedSetRating = watched.find((movie)=> movie.imdbID === selectedid )?.userRating

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

   const istop = imdbRating >8;
   console.log(istop);

  function handalAdd()
  {
    const newWatchedMovie = {
      imdbID:selectedid,
      title,
      year,
      poster,
      imdbRating:Number(imdbRating),
      runtime:Number(runtime.split("").at(0)),
      userRating,
    }
    onAddWatched(newWatchedMovie);
    onclosemovie();
  }

  useEffect(function()
  {
    function Callback (e){
      if (e.code=== "Escape")
       {
        onclosemovie();
       }
    }
    document.addEventListener("keydown", Callback);
    return function()
    {
      document.removeEventListener('keydown',Callback)
    }
  },[onclosemovie])

  useEffect(function()
  {
    async function getMovies()
    {
     setIsLoading(true);
      const res= await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedid}`);
      const data = await res.json();
      setMovie(data);
      setIsLoading(false);
    }
    getMovies();
  },[selectedid]);

  useEffect (function(){
    if(!title) return;
     document.title=`Movie | ${title}`
      return function()
      {
        document.title="Usepopcoren"
      };
  },[title])

 

  return(
   
   <div className="details">
    { isLoading ? (
       <Loding/>
    ):(
      <>
       <header> 
   <button className="btn-back" onClick={onclosemovie}>
    &larr;
   </button>
   <img src={poster} alt={`poster movie ${movie}`}/>
   <div className="details-overview">
    <h2>{title}</h2>
    <p>
      {released} &bull;{runtime}
    </p>
    <p>{genre}</p>
    <p>
    <span>⭐️</span>
    {imdbRating}IMDB Rating
    </p>

   </div>
   </header>

   <section>
   <div className="rating">
    
   {!IsWached ? (
     <div>
      <StarRating maxRating={10} 
                  size={24} 
                  onSetRating={setUserRating}/>
    { 
    userRating > 0 &&(
         <button className="btn-add" onClick={handalAdd}>
      + Add To List</button>)}
      </div>
      ):(
        <p>you  Rated The Movie {watchedSetRating} <span>⭐️</span> </p>
      )
      }
   </div>
   <p>
    <em>{plot}</em>
   </p>
   <p>
    starring {actors}
   </p>
   <p>
    directed by {director}
   </p>

   </section>
      </>
    )} 
   </div>
  );
}

  

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.lengt} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
  }

function WatchedMoviesList({ watched,ondeleteWatch}) {
  return (
    <ul className="list">
      {watched.map((picture) => (
        <WatchedMovie 
                movie={picture} 
                key={picture.imdbID}  
                ondeleteWatch={ondeleteWatch}/>
      ))}
    </ul>
  );
}

function WatchedMovie({ movie,ondeleteWatch }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button className="btn-delete" onClick={()=>ondeleteWatch(movie.imdbID)}>X </button>
      </div>
    </li>
  );
}
