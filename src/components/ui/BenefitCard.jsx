const BenefitCard = ({ benefit, index }) => (
  <div 
    key={index}
    className="contextboxbackground rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 text-center group"
  >
    <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/5 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
      <benefit.icon className="w-6 h-6 text-white" />
    </div>
    
    <h3 className="text-lg font-bold text-white contextboxtextshadow mb-2">
      {benefit.title}
    </h3>
    
    <p className="text-sm text-white/70">
      {benefit.description}
    </p>
  </div>
);

export default BenefitCard;
