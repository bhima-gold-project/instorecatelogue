import React from 'react'
import CategoryPage from './category/page'
import Banners from './banners/page'

const HomePage = () => {
  return (
    <div className='flex flex-col bg-cream min-h-screen'>
      <Banners />
      <CategoryPage />
    </div>
  )
}

export default HomePage