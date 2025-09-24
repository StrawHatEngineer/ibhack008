const FeatureCard = ({ feature, index }) => (
  <div 
    key={index}
    className="group contextboxbackground rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 hover:transform hover:scale-105"
  >
    <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
      <feature.icon className="w-8 h-8 text-white" />
    </div>
    
    <h3 className="text-2xl font-bold text-white contextboxtextshadow mb-4">
      {feature.title}
    </h3>
    
    <p className="text-white/70 leading-relaxed">
      {feature.description}
    </p>
  </div>
);

export default FeatureCard;
