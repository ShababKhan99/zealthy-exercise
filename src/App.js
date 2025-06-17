import React, { useState , useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle2, Settings, User, MapPin, Calendar, Menu } from 'lucide-react';
import './App.css';

import supabase from './supabaseClient';

export default function RegistrationLanding() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showData, setShowData] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  
  // Admin configuration state
  const [step2Sections, setStep2Sections] = useState(['About Me']);
  const [step3Sections, setStep3Sections] = useState(['Address']);
  
  // Form data for steps 2 and 3
  const [aboutMe, setAboutMe] = useState({ bio: '' });
  const [address, setAddress] = useState({ street: '', city: '', state: '', zipCode: '' });
  const [dateOfBirth, setDateOfBirth] = useState('');
  
  const availableSections = ['About Me', 'Address', 'Date of Birth'];

  // Handle URL routing
  useEffect(() => {
    const checkUrl = () => {
      const path = window.location.pathname;
      if (path === '/admin') {
        setShowAdmin(true);
        setShowData(false);
      } else if (path === '/data') {
        setShowData(true);
        setShowAdmin(false);
        fetchUsers();
      } else {
        setShowAdmin(false);
        setShowData(false);
      }
    };

    // Check initial URL
    checkUrl();

    // Listen for browser back/forward
    window.addEventListener('popstate', checkUrl);
    
    return () => {
      window.removeEventListener('popstate', checkUrl);
    };
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const navigateToData = () => {
    // Force URL update
    window.history.replaceState({}, '', '/data');
    setShowData(true);
    setShowAdmin(false);
    fetchUsers();
  };

  const navigateToAdmin = () => {
    // Force URL update
    window.history.replaceState({}, '', '/admin');
    setShowAdmin(true);
    setShowData(false);
  };

  const navigateToHome = () => {
    // Force URL update  
    window.history.replaceState({}, '', '/');
    setShowAdmin(false);
    setShowData(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([
          { email: email, password: password }
        ])
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setSuccess(true);
        console.log('User created successfully:', data[0]);
        console.log('Step 2 sections:', step2Sections);
        console.log('Step 3 sections:', step3Sections);
        
        setTimeout(() => {
          setCurrentStep(2);
          setSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Submit = async () => {
    setIsLoading(true);
    
    try {
      // Prepare data to update based on which sections are in step 2
      const updateData = {};
      
      if (step2Sections.includes('About Me')) {
        updateData.about_me = aboutMe.bio;
      }
      if (step2Sections.includes('Address')) {
        updateData.street = address.street;
        updateData.city = address.city;
        updateData.state = address.state;
        updateData.zip = address.zipCode;
      }
      if (step2Sections.includes('Date of Birth')) {
        updateData.dob = dateOfBirth;
      }

      // Update the user record with step 2 data
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('email', email)
        .select();

      if (error) {
        throw error;
      }

      console.log('Step 2 data saved:', data);
      setCurrentStep(3);
    } catch (error) {
      console.error('Error saving step 2 data:', error);
      setError(error.message || 'An error occurred saving your information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3Submit = async () => {
    setIsLoading(true);
    
    try {
      // Prepare data to update based on which sections are in step 3
      const updateData = {};
      
      if (step3Sections.includes('About Me')) {
        updateData.about_me = aboutMe.bio;
      }
      if (step3Sections.includes('Address')) {
        updateData.street = address.street;
        updateData.city = address.city;
        updateData.state = address.state;
        updateData.zip = address.zipCode;
      }
      if (step3Sections.includes('Date of Birth')) {
        updateData.dob = dateOfBirth;
      }

      // Update the user record with step 3 data
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('email', email)
        .select();

      if (error) {
        throw error;
      }

      console.log('Step 3 data saved:', data);
      console.log('Onboarding complete!');
      
      // Show success screen
      setOnboardingComplete(true);
    } catch (error) {
      console.error('Error saving step 3 data:', error);
      setError(error.message || 'An error occurred completing your registration');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToInitialScreen = () => {
    // Reset all form data and states
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setIsLoading(false);
    setError('');
    setSuccess(false);
    setCurrentStep(1);
    setOnboardingComplete(false);
    setAboutMe({ firstName: '', lastName: '', bio: '' });
    setAddress({ street: '', city: '', state: '', zipCode: '' });
    setDateOfBirth('');
  };

  const toggleSection = (step, section) => {
    if (step === 2) {
      setStep2Sections(prev => {
        if (prev.includes(section)) {
          if (prev.length === 1) return prev;
          return prev.filter(s => s !== section);
        } else {
          if (prev.length === 2) return prev;
          return [...prev, section];
        }
      });
    } else {
      setStep3Sections(prev => {
        if (prev.includes(section)) {
          if (prev.length === 1) return prev;
          return prev.filter(s => s !== section);
        } else {
          if (prev.length === 2) return prev;
          return [...prev, section];
        }
      });
    }
  };

  const renderSectionForm = (section) => {
    switch (section) {
      case 'About Me':
        return (
          <div className="section-form">
            <h3 className="section-title">About Me</h3>
            <div className="input-group">
              <label className="input-label">Bio</label>
              <div className="input-wrapper">
                <textarea
                  value={aboutMe.bio}
                  onChange={(e) => setAboutMe({...aboutMe, bio: e.target.value})}
                  className="input-field textarea-field"
                  placeholder="Tell us about yourself"
                  rows="3"
                />
              </div>
            </div>
          </div>
        );
      
      case 'Address':
        return (
          <div className="section-form">
            <h3 className="section-title">Address</h3>
            <div className="input-group">
              <label className="input-label">Street Address</label>
              <div className="input-wrapper">
                <MapPin className="input-icon input-icon-left" />
                <input
                  type="text"
                  value={address.street}
                  onChange={(e) => setAddress({...address, street: e.target.value})}
                  className="input-field"
                  placeholder="Enter your street address"
                />
              </div>
            </div>
            <div className="input-row">
              <div className="input-group">
                <label className="input-label">City</label>
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => setAddress({...address, city: e.target.value})}
                  className="input-field"
                  placeholder="City"
                />
              </div>
              <div className="input-group">
                <label className="input-label">State</label>
                <input
                  type="text"
                  value={address.state}
                  onChange={(e) => setAddress({...address, state: e.target.value})}
                  className="input-field"
                  placeholder="State"
                />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Zip Code</label>
              <input
                type="text"
                value={address.zipCode}
                onChange={(e) => setAddress({...address, zipCode: e.target.value})}
                className="input-field"
                placeholder="Zip Code"
                style={{maxWidth: '200px'}}
              />
            </div>
          </div>
        );
      
      case 'Date of Birth':
        return (
          <div className="section-form">
            <h3 className="section-title">Date of Birth</h3>
            <div className="input-group">
              <label className="input-label">Date of Birth</label>
              <div className="input-wrapper">
                <Calendar className="input-icon input-icon-left" />
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const isValidEmail = email.includes('@') && email.includes('.');
  const isValidPassword = password.length >= 8;
  const canProceed = isValidEmail && isValidPassword;

  // Data Page
  if (showData) {
    return (
      <div className="container">
        <div className="background-effects">
          <div className="bg-circle bg-circle-1"></div>
          <div className="bg-circle bg-circle-2"></div>
          <div className="bg-circle bg-circle-3"></div>
        </div>

        <div className="content-wrapper data-wrapper">
          <div className="main-card">
            <div className="card-header">
              <div className="icon-container">
                <User className="header-icon" />
              </div>
              <h1 className="title">User Database</h1>
              <p className="subtitle">View all registered users</p>
            </div>

            <div className="data-content">
              <div className="data-actions">
                <button
                  onClick={fetchUsers}
                  disabled={loadingUsers}
                  className={`refresh-button ${!loadingUsers ? 'submit-button-active' : 'submit-button-disabled'}`}
                >
                  {loadingUsers ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <span>Refresh Data</span>
                  )}
                </button>
                
                <button
                  onClick={navigateToHome}
                  className="submit-button submit-button-active"
                >
                  <span>Back to Registration</span>
                </button>
              </div>

              {loadingUsers ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <span className="loading-text">Loading users...</span>
                </div>
              ) : users.length === 0 ? (
                <div className="no-data">
                  <User className="no-data-icon" />
                  <h3 className="no-data-title">No Users Found</h3>
                  <p className="no-data-text">No users have registered yet.</p>
                </div>
              ) : (
                <div className="users-container">
                  <div className="users-header">
                    <h3 className="users-title">Registered Users ({users.length})</h3>
                  </div>
                  
                  <div className="users-grid">
                    {users.map((user, index) => (
                      <div key={user.id || index} className="user-card">
                        <div className="user-header">
                          <div className="user-avatar">
                            <User className="avatar-icon" />
                          </div>
                          <div className="user-info">
                            <h4 className="user-email">{user.email}</h4>
                            <span className="user-id">ID: {user.id}</span>
                          </div>
                        </div>
                        
                        <div className="user-details">
                          {user.about_me && (
                            <div className="detail-item">
                              <span className="detail-label">Bio:</span>
                              <span className="detail-value">{user.about_me}</span>
                            </div>
                          )}
                          
                          {(user.street || user.city || user.state || user.zip_code) && (
                            <div className="detail-item">
                              <span className="detail-label">Address:</span>
                              <span className="detail-value">
                                {[user.street, user.city, user.state, user.zip_code]
                                  .filter(Boolean)
                                  .join(', ')}
                              </span>
                            </div>
                          )}
                          
                          {user.date_of_birth && (
                            <div className="detail-item">
                              <span className="detail-label">Date of Birth:</span>
                              <span className="detail-value">
                                {new Date(user.date_of_birth).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          
                          {user.password && (
                            <div className="detail-item">
                              <span className="detail-label">Password:</span>
                              <span className="detail-value password-masked">••••••••</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Onboarding Success Screen
  if (onboardingComplete) {
    return (
      <div className="container">
        <div className="background-effects">
          <div className="bg-circle bg-circle-1"></div>
          <div className="bg-circle bg-circle-2"></div>
          <div className="bg-circle bg-circle-3"></div>
        </div>

        <div className="content-wrapper">
          <div className="main-card">
            <div className="card-header">
              <div className="icon-container success-icon-container">
                <CheckCircle2 className="header-icon" />
              </div>
              <h1 className="title">Welcome Aboard! 🎉</h1>
              <p className="subtitle">Your account has been successfully created</p>
            </div>

            <div className="success-content">
              <div className="success-details">
                <div className="success-item">
                  <CheckCircle2 className="success-check" />
                  <span>Account created</span>
                </div>
                <div className="success-item">
                  <CheckCircle2 className="success-check" />
                  <span>Profile information saved</span>
                </div>
                <div className="success-item">
                  <CheckCircle2 className="success-check" />
                  <span>Setup complete</span>
                </div>
              </div>

              <div className="success-message-box">
                <h3 className="success-message-title">You're all set!</h3>
                <p className="success-message-text">
                  Thank you for completing your registration. Your account is now ready to use.
                </p>
              </div>

              <button
                onClick={resetToInitialScreen}
                className="submit-button submit-button-active"
              >
                <span>Start New Registration</span>
                <ArrowRight className="continue-icon" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin Page
  if (showAdmin) {
    return (
      <div className="container">
        <div className="background-effects">
          <div className="bg-circle bg-circle-1"></div>
          <div className="bg-circle bg-circle-2"></div>
          <div className="bg-circle bg-circle-3"></div>
        </div>

        <div className="content-wrapper admin-wrapper">
          <div className="main-card">
            <div className="card-header">
              <div className="icon-container">
                <Settings className="header-icon" />
              </div>
              <h1 className="title">Admin Configuration</h1>
              <p className="subtitle">Configure onboarding form sections</p>
            </div>

            <div className="admin-content">
              <div className="step-config">
                <h3 className="step-title">Step 2 Sections</h3>
                <p className="step-description">
                  Select 1-2 sections for step 2 ({step2Sections.length}/2)
                </p>
                <div className="section-grid">
                  {availableSections.map(section => (
                    <button
                      key={section}
                      onClick={() => toggleSection(2, section)}
                      className={`section-button ${step2Sections.includes(section) ? 'selected' : ''}`}
                    >
                      <CheckCircle2 className={`section-check ${step2Sections.includes(section) ? 'visible' : ''}`} />
                      {section}
                    </button>
                  ))}
                </div>
              </div>

              <div className="step-config">
                <h3 className="step-title">Step 3 Sections</h3>
                <p className="step-description">
                  Select 1-2 sections for step 3 ({step3Sections.length}/2)
                </p>
                <div className="section-grid">
                  {availableSections.map(section => (
                    <button
                      key={section}
                      onClick={() => toggleSection(3, section)}
                      className={`section-button ${step3Sections.includes(section) ? 'selected' : ''}`}
                    >
                      <CheckCircle2 className={`section-check ${step3Sections.includes(section) ? 'visible' : ''}`} />
                      {section}
                    </button>
                  ))}
                </div>
              </div>

              <div className="config-preview">
                <h3 className="step-title">Configuration Preview</h3>
                <div className="preview-steps">
                  <div className="preview-step">
                    <strong>Step 2:</strong> {step2Sections.join(', ')}
                  </div>
                  <div className="preview-step">
                    <strong>Step 3:</strong> {step3Sections.join(', ')}
                  </div>
                </div>
              </div>

              <button
                onClick={navigateToHome}
                className="submit-button submit-button-active"
              >
                <span>Back to Registration</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2
  if (currentStep === 2) {
    return (
      <div className="container">
        <div className="background-effects">
          <div className="bg-circle bg-circle-1"></div>
          <div className="bg-circle bg-circle-2"></div>
          <div className="bg-circle bg-circle-3"></div>
        </div>

        <div className="content-wrapper">
          <div className="progress-section">
            <div className="progress-header">
              <span className="progress-step">Step 2 of 3</span>
              <span className="progress-label">Personal Information</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{width: '66.66%'}}></div>
            </div>
          </div>

          <div className="main-card">
            <div className="card-header">
              <div className="icon-container">
                <User className="header-icon" />
              </div>
              <h1 className="title">Personal Information</h1>
              <p className="subtitle">Tell us more about yourself</p>
            </div>

            <div className="form-container">
              {step2Sections.map(section => renderSectionForm(section))}
              
              <button
                onClick={handleStep2Submit}
                className="submit-button submit-button-active"
              >
                <span>Continue</span>
                <ArrowRight className="continue-icon" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3
  if (currentStep === 3) {
    return (
      <div className="container">
        <div className="background-effects">
          <div className="bg-circle bg-circle-1"></div>
          <div className="bg-circle bg-circle-2"></div>
          <div className="bg-circle bg-circle-3"></div>
        </div>

        <div className="content-wrapper">
          <div className="progress-section">
            <div className="progress-header">
              <span className="progress-step">Step 3 of 3</span>
              <span className="progress-label">Final Details</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{width: '100%'}}></div>
            </div>
          </div>

          <div className="main-card">
            <div className="card-header">
              <div className="icon-container">
                <CheckCircle2 className="header-icon" />
              </div>
              <h1 className="title">Almost Done!</h1>
              <p className="subtitle">Complete your profile</p>
            </div>

            <div className="form-container">
              {step3Sections.map(section => renderSectionForm(section))}
              
              <button
                onClick={handleStep3Submit}
                className="submit-button submit-button-active"
              >
                <span>Complete Registration</span>
                <CheckCircle2 className="continue-icon" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 1 (Original Registration)
  return (
    <div className="container">
      {/* Navigation Buttons */}
      <div className="nav-buttons">
        <button
          onClick={navigateToData}
          className="nav-button data-button"
          title="View User Data"
        >
          <Menu className="nav-icon" />
        </button>
        
        <button
          onClick={navigateToAdmin}
          className="nav-button admin-button"
          title="Admin Configuration"
        >
          <Settings className="nav-icon" />
        </button>
      </div>

      {/* Background Effects */}
      <div className="background-effects">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>

      <div className="content-wrapper">
        {/* Progress Indicator */}
        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-step">Step 1 of 3</span>
            <span className="progress-label">Account Setup</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar"></div>
          </div>
        </div>

        {/* Main Card */}
        <div className="main-card">
          {/* Header */}
          <div className="card-header">
            <div className="icon-container">
              <Mail className="header-icon" />
            </div>
            <h1 className="title">Create Account</h1>
            <p className="subtitle">Let's get you started with your new account</p>
          </div>

          {/* Form */}
          <div className="form-container">
            {/* Success Message */}
            {success && (
              <div className="success-message">
                <CheckCircle2 className="success-icon" />
                <span>Account created successfully!</span>
              </div>
            )}

            {/* Email Field */}
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon input-icon-left" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="Enter your email"
                  required
                />
                {isValidEmail && (
                  <CheckCircle2 className="input-icon input-icon-right validation-icon" />
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon input-icon-left" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? <EyeOff className="toggle-icon" /> : <Eye className="toggle-icon" />}
                </button>
              </div>
              <div className="password-hint">
                Password must be at least 8 characters long
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!canProceed || isLoading}
              className={`submit-button ${canProceed && !isLoading ? 'submit-button-active' : 'submit-button-disabled'}`}
            >
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="continue-icon" />
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="card-footer">
            <p className="footer-text">
              Already have an account?{' '}
              <button className="signin-link">Sign in</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}