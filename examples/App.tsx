import { effect, useState,useRef} from 'ez'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.scss'

function App() {
    const ref = useRef<HTMLDivElement>();
    const [getCount, setCount] = useState(0);
    const [getClassName, setClassName] = useState('xxx');
    effect(() => {
        console.log(ref.current)
        console.log("effect", getCount())
    })
    return (
        <>
            <div ref={ref}>
                <a href="https://vitejs.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo"/>
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo"/>
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                <p className={`test is ${getClassName()}`}>
                    kan
                </p>
                <button
                    onClick={() => {
                        setClassName("YYY");
                    }}
                >
                    改变className
                </button>
                <button
                    //className={createSignal(() => `count1 is ${getCount()}`)}
                    onClick={() => {
                        setCount((count) => count + 1);
                    }}
                >    <span>123</span>
                    count2 is
                    {getCount()}
                </button>
                {
                    getCount() === 2 ? <button>button</button> : <span>{"span"}{"GG"}</span>
                }
                <p className={"x"}>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
             <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    )
}

export default App