const mongoose = require("mongoose");
const resumeSchema = new mongoose.Schema(
    {
      user_id: {
        type: String,
     
        trim: true,
      },
      username: {
        type: String,
  
        trim: true,
      },
      firstName: {
        type: String,
        require: true,
        trim: true,
        min: 2,
        max: 100,
      },
      lastName: {
        type: String,
        require: true,
        trim: true,
        min: 2,
        max: 100,
      },
      label: {
        type: String,
        trim: true,
      },
      image: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        require: true,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      url: {
        type: String,
        trim: true,
      },
      summary: {
        type: String,
        trim: true,
      },
      location: {
        address: {
          type: String,
          trim: true,
        },
        postalCode: {
          type: String,
          trim: true,
        },
        city: {
          type: String,
          trim: true,
        },
        countryCode: {
          type: String,
          trim: true,
        },
        region: {
          type: String,
          trim: true,
        },
      },
      profiles: [
        {
          network: {
            type: String,
            trim: true,
          },
          username: {
            type: String,
            trim: true,
          },
          url: {
            type: String,
            trim: true,
          },
        },
      ],
      work: [
        {
          name: {
            type: String,
            trim: true,
          },
          position: {
            type: String,
            trim: true,
          },
          url: {
            type: String,
            trim: true,
          },
          startDate: Date,
          endDate: Date,
          summary: {
            type: String,
            trim: true,
          },
          experienceLetter: {
            type: String,
            trim: true,
          },
          highlights: [
            {
              type: String,
              trim: true,
            },
          ],
        },
      ],
      volunteer: [
        {
          organization: {
            type: String,
            trim: true,
          },
          position: {
            type: String,
            trim: true,
          },
          url: {
            type: String,
            trim: true,
          },
          startDate: Date,
          endDate: Date,
          summary: {
            type: String,
            trim: true,
          },
          highlights: [
            {
              type: String,
              trim: true,
            },
          ],
        },
      ],
      education: [
        {
          institution: {
            type: String,
            trim: true,
          },
          url: {
            type: String,
            trim: true,
          },
          area: {
            type: String,
            trim: true,
          },
          studyType: {
            type: String,
            trim: true,
          },
          startDate: Date,
          endDate: Date,
          score: {
            type: String,
            trim: true,
          },
          courses: [
            {
              type: String,
              trim: true,
            },
          ],
        },
      ],
      awards: [
        {
          title: {
            type: String,
            trim: true,
          },
          date: Date,
          awarder: {
            type: String,
            trim: true,
          },
          summary: {
            type: String,
            trim: true,
          },
        },
      ],
      certificates: [
        {
          name: {
            type: String,
            trim: true,
          },
          date: Date,
          issuer: {
            type: String,
            trim: true,
          },
          url: {
            type: String,
            trim: true,
          },
        },
      ],
      publications: [
        {
          name: {
            type: String,
            trim: true,
          },
          publisher: {
            type: String,
            trim: true,
          },
          releaseDate: Date,
          url: {
            type: String,
            trim: true,
          },
          summary: {
            type: String,
            trim: true,
          },
        },
      ],
      skills: [
        {
          last_used: {
            type: String, // Consider changing this to Date if it's a date value
            trim: true,
          },
          name: {
            type: String,
            trim: true,
          },
          scale: {
            type: String,
            trim: true,
          },
          title: {
            type: String,
            trim: true,
          },
          total_years: {
            type: String, // Consider changing this to a number if it's numeric data
            trim: true,
          },
        },
      ],
      languages: [
        {
          language: {
            type: String,
            trim: true,
          },
          fluency: {
            type: String,
            trim: true,
          },
        },
      ],
      interests: [
        {
          name: {
            type: String,
            trim: true,
          },
          keywords: [
            {
              type: String,
              trim: true,
            },
          ],
        },
      ],
      references: [
        {
          name: {
            type: String,
            trim: true,
          },
          reference: {
            type: String,
            trim: true,
          },
        },
      ],
      projects: [
        {
          name: {
            type: String,
            trim: true,
          },
          startDate: Date,
          endDate: Date,
          description: {
            type: String,
            trim: true,
          },
          highlights: [
            {
              type: String,
              trim: true,
            },
          ],
          url: {
            type: String,
            trim: true,
          },
          repositoryUrl: {
            type: String,
            trim: true,
          },
        },
      ],
    },
    {
      timestamps: true, // Enable createdAt and updatedAt fields
    }
  );
//For get fullName from when we get data from database
resumeSchema.virtual("name").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model("Resumes", resumeSchema);
