
Pod::Spec.new do |s|

    s.name         = "ti.superwall"
    s.version      = "1.0.0"
    s.summary      = "The ti.superwall Titanium module."
  
    s.description  = <<-DESC
                     The ti.superwall Titanium module.
                     DESC
  
   s.homepage     = "https://github.com/narbs/ti.superwall"
    s.license      = { :type => "Apache 2", :file => "LICENSE" }
    s.author       = 'Author'
  
    s.platform     = :ios
    s.ios.deployment_target = '8.0'
  
    s.source       = { :git => "https://github.com/narbs/ti.superwall" }
    
    s.ios.weak_frameworks = 'UIKit', 'Foundation'

    s.ios.dependency 'TitaniumKit'
  
    s.public_header_files = 'Classes/*.h'
    s.source_files = 'Classes/*.{h,m,swift}'
  end