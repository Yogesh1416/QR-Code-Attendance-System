import './Spinner.css'

export default function Spinner({ size = 20, color = '#fff' }) {
  return (
    <span
      className="spinner"
      style={{ width: size, height: size, borderTopColor: color }}
    />
  )
}
