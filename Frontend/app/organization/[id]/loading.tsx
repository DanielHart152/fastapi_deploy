export default function Loading() {
  return (
    <div className="min-h-screen relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(/images/gradient-background.jpg)",
        }}
      />
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    </div>
  )
}
