import React, {useState, useEffect} from "react";
import "@styles/tailwind.css";

export function Main(p) {
    return (<div>Emty main page</div>);
}

export function NotFound(p) {
    return (<div>Error 404! Page is not found! React is tried</div>);
}

export function AppBase(p) {

	let [date, setDate] = useState(new Date());
    let [isShowDetail, setisShowDetail] = useState(false);
	
    useEffect(() => {
        // if (confirm("qwe")) {
        //     setisShowDetail(true);
        // }
    }, []);

    // const toggleisShowDetail = () => {
    //     setisShowDetail(!isShowDetail);
    // }

	return (
		<div className="flex justify-center items-center min-h-screen w-screen">
            {/* <button onClick={toggleisShowDetail()}>Item Detail</button> */}
            <div style={{}}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse venenatis nibh ac arcu fermentum, a finibus risus condimentum. Mauris nec dolor metus. Sed bibendum finibus quam sit amet porttitor. Pellentesque interdum at sapien vel venenatis. Maecenas aliquam, augue maximus maximus sodales, mauris ipsum commodo ipsum, et cursus lorem sapien et dolor. Interdum et malesuada fames ac ante ipsum primis in faucibus. Praesent placerat est vel velit elementum pharetra. In ullamcorper sagittis enim non molestie. Integer consectetur tincidunt lacus. Fusce non eros sollicitudin, consequat mauris vel, posuere purus. Aliquam ultricies risus enim, ut interdum velit finibus id.
                Fusce tristique risus massa, pulvinar aliquam neque consequat sed. Nulla ligula quam, semper a eros sed, elementum sodales turpis. Sed convallis commodo odio, sed accumsan arcu varius non. Vestibulum in elementum nisl. Maecenas viverra nunc eros, vitae egestas est sagittis ut. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Pellentesque suscipit egestas leo eu pretium. Nullam dapibus urna ultricies metus semper lobortis. Donec sed metus nibh. Nunc laoreet ligula at magna semper, vitae pulvinar enim hendrerit. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vivamus pellentesque lectus non lectus ultricies efficitur. Integer ex nisl, vehicula ut urna eu, molestie pulvinar sem. Fusce ex nulla, gravida non turpis ac, pulvinar tempor nunc. Nunc vitae orci vitae leo tincidunt tincidunt.
                Vestibulum nec quam ultricies, condimentum magna aliquet, rutrum nisi. Curabitur ut convallis dolor. Aliquam interdum, velit ac faucibus sollicitudin, nibh arcu sodales eros, vitae convallis massa nisi sed ante. Nunc finibus nunc vel neque accumsan mollis. Quisque finibus quam at turpis iaculis, in sagittis nisl porta. Suspendisse nunc felis, pharetra in turpis sed, consectetur iaculis justo. Sed rhoncus non tellus in ultrices. Aenean dictum mauris a tortor pulvinar, et fringilla mauris elementum. Nulla et velit ultrices, finibus mi at, laoreet lacus. Nunc mollis feugiat justo, at lacinia mi. Mauris venenatis suscipit est ac condimentum. Nunc pharetra nisi ac fringilla hendrerit.
                Nunc molestie est consectetur dui feugiat accumsan. In et tristique est. Duis sed luctus diam, a fringilla arcu. Nulla nulla enim, maximus eget leo ac, tempor tempor tellus. Aliquam efficitur ante justo, a volutpat nunc sollicitudin id. Mauris porttitor sapien ligula, a tempus felis sollicitudin et. Phasellus eget augue vitae libero feugiat fermentum non et lacus. Sed at sem leo. Phasellus varius odio magna, quis accumsan erat euismod sit amet. Maecenas gravida, leo vitae efficitur vehicula, elit massa dignissim ipsum, sit amet volutpat risus ligula sit amet orci. Nunc maximus in ex ac imperdiet. Morbi sollicitudin at lacus at feugiat. Praesent velit lacus, rutrum pellentesque eros id, molestie iaculis quam. Nunc suscipit sollicitudin ipsum. Vestibulum at blandit tortor.
                Pellentesque quis nisi lectus. Sed eget neque nec mi pretium dapibus. Ut ex massa, vestibulum at vestibulum sed, sollicitudin at elit. Curabitur enim nisl, auctor id varius at, semper ac odio. Fusce commodo, leo a elementum mattis, augue metus hendrerit urna, ac rutrum lorem nunc at purus. Pellentesque massa risus, volutpat vitae rhoncus id, ultrices non dolor. Nulla quam tellus, porta id eleifend ut, posuere ut libero. Praesent dui enim, fermentum id placerat eu, porta eget neque.
            </div>
            {(isShowDetail || true) && <ItemDetail />}
		</div>
	);
}

export function PopUpConfirm(p) {
    return (
        <div className="popUpConfirm">
            <div style={{position: "absolute", left: "0", top: "0", width: "100vw", height: "100vh", background:"red"}}></div>
            <div></div>
        </div>
    )
}

export function ItemDetail(p) {
    setTimeout(() =>{
        let el = document.querySelector(".itemDetail");
        el.classList.remove('opacity-0');
        el.classList.add('opacity-100');
    }, 100);

    return (
        <div className="itemDetail fixed inset-0 flex justify-center items-center w-screen h-screen z-50 opacity-0 transition-opacity duration-500 ease-in-out">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" ></div>
            <div className="relative left-0 top-0 z-22 w-3/4 h-4/5 bg-white border-gray-600 rounded-lg shadow-lg padding-sm p-[20px] grid grid-rows-[1fr_6fr_1fr]" style={{}}>
                <div className="border-black" >{p.Header || "Header"}</div>
                <div className="border-black">{p.Body || "Body"}</div>
                <div>
                    qwe
                </div>
            </div>
        </div>
    )
}



