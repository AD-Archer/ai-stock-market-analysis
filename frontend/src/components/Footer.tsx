const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer mt-5 py-3 bg-light">
      <div className="container text-center">
        <span className="text-muted">Stock Market Analysis &copy; {currentYear}</span>
      </div>
    </footer>
  );
};

export default Footer; 