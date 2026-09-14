import style from './Inverted.module.css'
const InvertedCard = ({site,img}) => {
  return (
    <>
    <div className={style.container}>
        <div className={style.card}>
            <div className={`${style.cardimg} object-cover`}>
                <img src={img} alt="image" />
            </div>
            <div className={style.tag}>
                <p><span>{site}</span></p>
            </div>
            <div className={style.curve_one}></div>
            <div className={style.curve_two}></div>
        </div>
    </div>
    </>
  )
}

export default InvertedCard