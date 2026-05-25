import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface Props { children: ReactNode }

const variants = {
  initial: { opacity: 0, y: -14 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: 10 },
}

export default function PageWrapper({ children }: Props) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
