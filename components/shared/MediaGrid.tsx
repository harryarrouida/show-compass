<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 
                gap-4 sm:gap-6 md:gap-8">
  {items.map(item => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <MediaCard item={item} />
    </motion.div>
  ))}
</div> 