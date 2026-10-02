import React from 'react'

interface FloatBoxProps {
  className?: string
  index?: string
  kicker?: string
  title?: string
  lead?: string
  children?: React.ReactNode
}

export function FloatBox({ className = '', index, kicker, title, lead, children }: FloatBoxProps) {
  return (
    <article className={`float-box ${className}`}>
      {index && <span className="box-index" aria-hidden="true">{index}</span>}
      {kicker && <div className="kicker">{kicker}</div>}
      {title && <h2 className="big-title">{title}</h2>}
      {lead && <p className="lead">{lead}</p>}
      {children}
    </article>
  )
}
