import {effect, useRef, useState,} from 'ez'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.scss'

/*type MyProps = {
    a: string;
    b: string
}
type OrSignalLike<T> = {
    [P in keyof T]: SignalLike<T[P]> | T[P];
};

function MyTest({a, b}: OrSignalLike<MyProps>) {
    const ref = useRef<HTMLDivElement>();
    effect(() => {
        //console.log("MyTest--effect", a.valueOf(),b.valueOf())
    })
    useMounted(() => {
        //console.log('useMounted',ref.current)
        return () => {
            //console.log('useMounted-un',ref.current)
        }
    })
    useUnMounted(() => {
        //console.log('UnMounted',ref.current)
    })
    return <div ref={ref} className={a.valueOf()}>{a.valueOf()}{b.valueOf()}</div>
}*/

function App() {
    const ref = useRef<HTMLDivElement>();
    const [getCount, setCount] = useState(0);
    const [$name, setClassName] = useState('xxx');
    const [$list, setList] = useState<number[]>([1,2]);

    effect(() => {
        //console.log(ref.current)
        //console.log("effect", getCount())
    })
    return (
        <>
            {/*{
                getCount() === 2 ? <MyTest a={$name()} b="nnn"/> : <MyTest a={"2"} b="nnn"/>
            }*/}
            {
                $list().map(item=>{
                    return <div>{item}</div>
                })
            }
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
                <p className={`test is ${$name()}`}>
                    kan
                </p>
                <button
                    onClick={() => {
                        setList([1,2,3]);
                    }}
                >
                    改变Array
                </button>
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
                ><span>123</span>
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