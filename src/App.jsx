import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import "../src/App.css";
import logo from './assets/macmillan-logo.png'

const App = () => {
  // Form state with consolidated initialization
  const [formData, setFormData] = useState({
    // Author Information
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    biography: "",
    country: "",
    websiteAddress: "",
    blogAddress: "",
    socialMediaHandle: "",
    everPublishedaBook: "",
    everRepresentedbyAgent: "",
    whoReferred: "",
    bookInspiration: "",

    // Book Information
    bookTitle: "",
    bookGenre: "",
    bookWordCount: "",
    bookEverPublished: "",
    bookSynopsis: "",
    pitch: "",
  });
  
  // File and form state
  const [bookFile, setBookFile] = useState(null);
  const [formStatus, setFormStatus] = useState({
    isSubmitting: false,
    submissionSuccess: false,
    currentStep: 1,
    progress: 33,
  });
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [expandedFields, setExpandedFields] = useState({});

  // List of countries for the dropdown
  const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
    "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
    "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
    "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
    "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
    "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon",
    "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
    "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
    "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo",
    "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania",
    "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius",
    "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia",
    "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman",
    "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
    "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
    "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
    "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan",
    "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
    "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
    "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
  ];

  // List of common book genres
  const genres = [
    "Fiction", "Literary Fiction", "Science Fiction", "Fantasy", "Mystery", "Thriller", "Horror", 
    "Romance", "Historical Fiction", "Western", "Dystopian", "Contemporary Fiction", 
    "Non-Fiction", "Memoir", "Biography", "Autobiography", "Self-Help", "History", 
    "True Crime", "Science", "Travel", "Essay Collection", "Poetry", "Children's", 
    "Middle Grade", "Young Adult", "Graphic Novel", "Short Story Collection"
  ];

  const navigateTo = useNavigate();
  const baseUrl = import.meta.env.VITE_API_URL;

  // Helper functions
  const handleRedirect = () => {
    window.location.href = "https://us.macmillan.com/";
  };

  // Toggle expanded text fields in review step
  const toggleExpand = (field) => {
    setExpandedFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Consolidated input change handler
  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    // Handle file input separately
    if (type === "file") {
      if (files[0]) {
        // Check file size (2MB limit)
        if (files[0].size > 2 * 1024 * 1024) {
          setErrors(prev => ({
            ...prev,
            bookFile: "File size exceeds 2MB limit"
          }));
          return;
        }
        
        // Check file type
        const fileType = files[0].name.split('.').pop().toLowerCase();
        if (!['doc', 'docx', 'png'].includes(fileType)) {
          setErrors(prev => ({
            ...prev,
            bookFile: "Only .doc and .docx files are accepted"
          }));
          return;
        }
        
        setBookFile(files[0]);
        setErrors(prev => {
          const newErrors = {...prev};
          delete newErrors.bookFile;
          return newErrors;
        });
      }
      return;
    }
    
    // Handle all other inputs
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Mark field as touched for validation
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));
  };

  // Validate form data
  const validateForm = (data, step) => {
    const newErrors = {};
    
    // Only validate fields relevant to current step
    if (step === 1) {
      // Author information validation
      if (!data.firstname) newErrors.firstname = "First name is required";
      if (!data.lastname) newErrors.lastname = "Last name is required";
      if (!data.email) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        newErrors.email = "Invalid email format";
      }
      if (!data.phone) newErrors.phone = "Phone number is required";
      if (!data.biography) newErrors.biography = "Biography is required";
      if (!data.country) newErrors.country = "Country is required";
    } else if (step === 2) {
      // Book information validation
      if (!data.bookTitle) newErrors.bookTitle = "Book title is required";
      if (!data.bookGenre) newErrors.bookGenre = "Genre is required";
      if (!data.bookWordCount) {
        newErrors.bookWordCount = "Word count is required";
      } else if (!/^\d+$/.test(data.bookWordCount)) {
        newErrors.bookWordCount = "Word count must be a number";
      }
      if (!data.bookSynopsis) newErrors.bookSynopsis = "Synopsis is required";
      if (!data.pitch) newErrors.pitch = "Pitch is required";
      if (!bookFile) newErrors.bookFile = "Please upload your manuscript";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigate between steps
  const goToNextStep = () => {
    const isValid = validateForm(formData, formStatus.currentStep);
    
    if (isValid) {
      setFormStatus(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1,
        progress: prev.currentStep === 1 ? 66 : 100
      }));
      window.scrollTo(0, 0);
    } else {
      // Highlight all errors in current step
      const relevantFields = Object.keys(errors);
      const newTouchedFields = {};
      
      relevantFields.forEach(field => {
        newTouchedFields[field] = true;
      });
      
      setTouchedFields(prev => ({
        ...prev,
        ...newTouchedFields
      }));
      
      // Show toast notification
      toast.error("Please input all required fields before submitting");
    }
  };
  
  const goToPrevStep = () => {
    setFormStatus(prev => ({
      ...prev,
      currentStep: prev.currentStep - 1,
      progress: prev.currentStep === 3 ? 66 : 33
    }));
    window.scrollTo(0, 0);
  };

  // Submit the form
  const handleSubmission = async (e) => {
    e.preventDefault();
    
    // Final validation
    const isValid = validateForm(formData, formStatus.currentStep);
    if (!isValid) {
      // Highlight all errors
      const relevantFields = Object.keys(errors);
      const newTouchedFields = {};
      
      relevantFields.forEach(field => {
        newTouchedFields[field] = true;
      });
      
      setTouchedFields(prev => ({
        ...prev,
        ...newTouchedFields
      }));
      
      toast.error("Please input all required fields before submitting");
      return;
    }

    setFormStatus(prev => ({ ...prev, isSubmitting: true }));

    try {
      const formDataToSend = new FormData();
      
      // Append book file
      formDataToSend.append("bookFile", bookFile);
      
      // Append form data
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      // Send data to server
      const response = await axios.post(`${baseUrl}/submit`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      });
      
      console.log("Response:", response.data);

      // Show success state after a short delay
      setTimeout(() => {
        setFormStatus(prev => ({
          ...prev,
          isSubmitting: false,
          submissionSuccess: true
        }));
        
        // Redirect after showing success message
        setTimeout(handleRedirect, 5000);
      }, 10000);
      
    } catch (err) {
      setFormStatus(prev => ({ ...prev, isSubmitting: false }));
      
      const errorMessage = err.response?.data?.message || 
        "Something went wrong. Please try again.";
      toast.error(errorMessage);
      console.error("Error during book submission:", err.message);
    }
  };

  // Render form field with validation
  const renderField = (name, label, type = "text", required = false, placeholder = "", helpText = "", options = null) => {
    return (
      <div className="w-full mb-6">
        <label htmlFor={name} className="block text-sm font-medium mb-2 text-gray-800">
          {label} {required && <span className="text-red-600 text-xs">(required)</span>}
        </label>
        
        {type === "textarea" ? (
          <textarea
            id={name}
            name={name}
            value={formData[name]}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={`w-full p-3 border rounded-md bg-white outline-none focus:ring-2 focus:ring-black transition-all ${
              errors[name] && touchedFields[name] ? "border-red-600" : "border-gray-300"
            }`}
            rows={5}
          />
        ) : type === "radio" ? (
          <div className="flex space-x-6 mt-2">
            <label className="flex items-center space-x-2 text-gray-800">
              <input
                type="radio"
                name={name}
                value="true"
                checked={formData[name] === "true"}
                onChange={handleInputChange}
                className="form-radio text-black focus:ring-black"
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center space-x-2 text-gray-800">
              <input
                type="radio" 
                name={name}
                value="false"
                checked={formData[name] === "false"}
                onChange={handleInputChange}
                className="form-radio text-black focus:ring-black"
              />
              <span>No</span>
            </label>
          </div>
        ) : type === "file" ? (
          <div className="mt-1">
            <label className="w-full flex items-center px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-sm text-gray-600">
                {bookFile ? bookFile.name : "Select manuscript file..."}
              </span>
              <input
                id={name}
                name={name}
                type="file"
                onChange={handleInputChange}
                className="sr-only"
                accept=".doc,.docx"
              />
            </label>
          </div>
        ) : type === "select" ? (
          <select
            id={name}
            name={name}
            value={formData[name]}
            onChange={handleInputChange}
            className={`w-full p-3 border rounded-md bg-white outline-none focus:ring-2 focus:ring-black transition-all ${
              errors[name] && touchedFields[name] ? "border-red-600" : "border-gray-300"
            }`}
          >
            <option value="">{placeholder}</option>
            {options && options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={formData[name]}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={`w-full p-3 border rounded-md bg-white outline-none focus:ring-2 focus:ring-black transition-all ${
              errors[name] && touchedFields[name] ? "border-red-600" : "border-gray-300"
            }`}
          />
        )}
        
        {errors[name] && touchedFields[name] && (
          <p className="mt-1 text-sm text-red-600">{errors[name]}</p>
        )}
        
        {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header with logo */}
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <div className="flex justify-center items-center mb-10">
          <img 
            src="https://d3ialxc06lvqvq.cloudfront.net/wp-content/uploads/2023/04/27022218/macmillan-logo-red-1-287x64.png" 
            alt="Macmillan Publishers Logo" 
            className="h-12 max-md:h-10 object-contain"
          />
        </div>
        <h1 className="max-md:text-3xl text-4xl font-bold text-black mb-4">
          Submit Your Manuscript to Macmillan’s Talent Discovery Portal
        </h1>
        <p className="max-md:text-sm text-lg text-gray-600 max-w-3xl mx-auto">
         Ready to Take the Leap?

    If you believe your story deserves a place in the world, we want to hear it.
    This is not just a submission form — it’s your doorway into Macmillan’s elite talent discovery and development ecosystem.
    Whether you’re a debut writer or an undiscovered gem, we’re actively scouting for voices that move, challenge, and endure.


        </p>
        
        {/* Progress bar */}
        <div className="mt-12 mb-8">
          <div className="relative pt-1">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-black">
                Discovery Stage {formStatus.currentStep} of 3
              </div>
              <div className="text-sm font-medium text-gray-500">
                {formStatus.progress}% Complete
              </div>
            </div>
            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
              <div 
                style={{ width: `${formStatus.progress}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-black transition-all duration-500"
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main form */}
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmission} className="space-y-8">
          {/* Step 1: Author Information */}
          {formStatus.currentStep === 1 && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="bg-black px-6 py-5">
                <h2 className="text-xl font-bold text-white">
                  Author Information
                </h2>
                <p className="text-sm text-gray-300 mt-1">
                  We champion writers as much as writing. Briefly tell us who you are.
                </p>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                  {renderField("firstname", "First Name", "text", true, "Enter your first name")}
                  {renderField("lastname", "Last Name", "text", true, "Enter your last name")}
                </div>
                
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                  {renderField("email", "Email Address", "email", true, "For confidential feedback, review updates, and next steps.")}
                  {renderField("phone", "Phone Number", "text", true, "Only used if your work moves to internal consideration.")}
                </div>
                
                {renderField("country", "Country", "select", true, "Select your country", "Please select the country where you currently reside.", countries)}
                
                {renderField("biography", "Biography", "textarea", true, 
                  "Make us curious. What makes you unforgettable as an author?", 
                  "Include your background, writing experience, and any relevant credentials.")}
                
                <div className="border-t border-gray-200 my-8"></div>
                
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                  {renderField("websiteAddress", "Website", "text", false, "https://your-website.com")}
                  {renderField("blogAddress", "Blog", "text", false, "https://your-blog.com")}
                </div>
                
                {renderField("socialMediaHandle", "Social Media Handle", "text", false, "@username")}
                
                <div className="border-t border-gray-200 my-8"></div>
                
                {renderField("everPublishedaBook", "Have you previously published books?", "radio")}
                {renderField("everRepresentedbyAgent", "Have you been represented by a literary agent before?", "radio")}
                {renderField("whoReferred", "If this is a referral, who referred you?", "text", false, "Name or social media handle")}
                
                {renderField("bookInspiration", "What inspired this work?", "textarea", false, 
                  "Share the inspiration behind your book...", 
                  "What sparked this book, and why now?")}
                
                <div className="flex justify-end mt-8">
                  <button
                    type="button"
                    onClick={goToNextStep}
                    className="px-6 py-3 bg-black text-white font-medium rounded-md shadow hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors flex items-center"
                  >
                    Next: Book Details
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Book Information */}
          {formStatus.currentStep === 2 && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="bg-black px-6 py-5">
                <h2 className="text-xl font-bold text-white">
                  Book Information
                </h2>
                <p className="text-sm text-gray-300 mt-1">
                  Tell us about your book that could change everything
                </p>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
                  {renderField("bookTitle", "Book Title", "text", true, "The first signal of your voice. Make it memorable.")}
                  {renderField("bookGenre", "Genre", "select", true, "Select your book's genre", 
                    "Please accurately specify your genre, as incorrect categorization may affect review.", genres)}
                  {renderField("bookWordCount", "Word Count", "text", true, "e.g., 75000", 
                    "Enter numbers only, no commas or special characters.")}
                </div>
                
                <div className="border-t border-gray-200 my-8"></div>
                
                {renderField("bookEverPublished", "Has this book been published before?", "radio")}
                
                {renderField("bookSynopsis", "Synopsis", "textarea", true, 
                  "Summarize your book...", 
                  "Provide a concise overview of your book's plot, themes, and main characters.")}
                
                <div className="border-t border-gray-200 my-8"></div>
                
                {renderField("bookFile", "First 10 Pages", "file", true, "",
                  "For shorter works like picture books, please include the entire text. Acceptable formats: .doc, pdf, .docx (Max 5MB)")}
                
                {renderField("pitch", "Elevator Pitch", "textarea", true, 
                  "Imagine this on a Netflix pitch deck. What’s the hook?", 
                  "Capture the essence of your book in a compelling one-sentence pitch.")}
                
                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={goToPrevStep}
                    className="px-6 py-3 bg-gray-200 text-black font-medium rounded-md shadow hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back
                  </button>
                  
                  <button
                    type="button"
                    onClick={goToNextStep}
                    className="px-6 py-3 bg-black text-white font-medium rounded-md shadow hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors flex items-center"
                  >
                    Review & Submit
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Review & Submit */}
          {formStatus.currentStep === 3 && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="bg-black px-6 py-5">
                <h2 className="text-xl font-bold text-white">
                  Review & Submit
                </h2>
                <p className="text-sm text-gray-300 mt-1">
                  Please review your information before submitting
                </p>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="bg-gray-50 rounded-md p-6 mb-6 border border-gray-100">
                  <h3 className="text-lg font-medium text-black mb-4">Author Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="mt-1">{formData.firstname} {formData.lastname}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Contact</p>
                      <p className="mt-1">{formData.email} | {formData.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Country</p>
                      <p className="mt-1">{formData.country}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-500">Biography</p>
                      <div className="mt-1">
                        {expandedFields.biography ? (
                          <div>
                            <p className="text-gray-700">{formData.biography}</p>
                            <button 
                              type="button"
                              onClick={() => toggleExpand('biography')} 
                              className="text-sm text-black underline mt-2 hover:text-gray-600"
                            >
                              Show less
                            </button>
                          </div>
                        ) : (
                          <div>
                            <p className="text-gray-700 line-clamp-2">{formData.biography}</p>
                            <button 
                              type="button"
                              onClick={() => toggleExpand('biography')} 
                              className="text-sm text-black underline mt-1 hover:text-gray-600"
                            >
                              Read more
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-md p-6 border border-gray-100">
                  <h3 className="text-lg font-medium text-black mb-4">Book Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Title</p>
                      <p className="mt-1">{formData.bookTitle}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Genre</p>
                      <p className="mt-1">{formData.bookGenre}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Genre</p>
                      <p className="mt-1">{formData.bookGenre}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Word Count</p>
                      <p className="mt-1">{formData.bookWordCount}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">File Uploaded</p>
                      <p className="mt-1">{bookFile ? bookFile.name : "No file selected"}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-500">Synopsis</p>
                      <div className="mt-1">
                        {expandedFields.bookSynopsis ? (
                          <div>
                            <p className="text-gray-700">{formData.bookSynopsis}</p>
                            <button 
                              type="button"
                              onClick={() => toggleExpand('bookSynopsis')} 
                              className="text-sm text-black underline mt-2 hover:text-gray-600"
                            >
                              Show less
                            </button>
                          </div>
                        ) : (
                          <div>
                            <p className="text-gray-700 line-clamp-2">{formData.bookSynopsis}</p>
                            <button 
                              type="button"
                              onClick={() => toggleExpand('bookSynopsis')} 
                              className="text-sm text-black underline mt-1 hover:text-gray-600"
                            >
                              Read more
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-500">Elevator Pitch</p>
                      <p className="mt-1 italic">{formData.pitch}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 my-8"></div>
                
                <div className="bg-gray-50 rounded-md p-6 border border-gray-100">
                  <p className="text-sm text-gray-700">
                   By submitting, you confirm this is your original work.
                  Your submission will be reviewed by a Macmillan-affiliated acquisitions scout.
                  Selected works may be fast-tracked for internal development consideration.
                  </p>
                </div>
                
                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={goToPrevStep}
                    className="px-6 py-3 bg-gray-200 text-black font-medium rounded-md shadow hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Edit
                  </button>
                  
                  <button
                    type="submit"
                    disabled={formStatus.isSubmitting}
                    className={`px-6 py-3 bg-black text-white font-medium rounded-md shadow focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors flex items-center ${
                      formStatus.isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-800"
                    }`}
                  >
                    {formStatus.isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Submit Manuscript
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
      
      {/* Footer */}
      <div className="max-w-4xl mx-auto mt-12 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Macmillan Publishers LLC. All rights reserved.</p>
        <div className="mt-2 flex justify-center space-x-4">
          <a href="#" className="hover:text-black transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-black transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-black transition-colors">Contact Us</a>
        </div>
      </div>
      
      {/* Loading/Success overlay */}
      {(formStatus.isSubmitting || formStatus.submissionSuccess) && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center">
            {formStatus.isSubmitting && (
              <>
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-black mx-auto mb-6"></div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Submitting Your Manuscript</h3>
                <p className="text-gray-500">Please wait while we process your submission...</p>
              </>
            )}
            
            {formStatus.submissionSuccess && (
              <>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                  <svg className="h-10 w-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Submission Successful!</h3>
                <p className="text-gray-600 mb-4">Your manuscript is now under confidential review by our editorial team. If we see potential, we’ll extend a formal Discovery Invitation. No need to follow up...we’ll reach out.</p>
                <p className="text-sm text-gray-400">Redirecting to our website...</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
