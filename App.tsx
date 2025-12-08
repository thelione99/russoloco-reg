// App.tsx (MODIFICA TEMPORANEA PER TEST)

// ... (lascia tutti gli import in alto)
// ... (lascia il componente Navigation)
// ... (lascia il componente Footer)


const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen bg-black text-white font-sans selection:bg-red-500/30 selection:text-white">
        <h1 className="text-3xl font-bold text-white text-center pt-20">
            TEST DI CARICAMENTO OK!
        </h1>
        {/* <Routes> ... </Routes> */} {/* Commenta Routes */}
        <Navigation />
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;