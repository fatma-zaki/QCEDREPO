// Decorative petal/star line motif echoing the Qassim Chamber logo.
const StarBurst = ({ className = '', petals = 8 }) => (
  <svg viewBox="0 0 200 200" fill="none" aria-hidden="true" className={className}>
    {Array.from({ length: petals }).map((_, i) => (
      <ellipse
        key={i}
        cx="100"
        cy="100"
        rx="92"
        ry="30"
        stroke="currentColor"
        strokeWidth="0.8"
        transform={`rotate(${(180 / petals) * i} 100 100)`}
      />
    ))}
  </svg>
)

export default StarBurst
