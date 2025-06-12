import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './BookForm.css';

const GENRES = [
    { value: 'Fiction', label: 'Fiction' },
    { value: 'Non-Fiction', label: 'Non-Fiction' },
    { value: 'Mystery', label: 'Mystery' },
    { value: 'Thriller', label: 'Thriller' },
    { value: 'Romance', label: 'Romance' },
    { value: 'Science Fiction', label: 'Science Fiction' },
    { value: 'Fantasy', label: 'Fantasy' },
    { value: 'Horror', label: 'Horror' },
    { value: 'Biography', label: 'Biography' },
    { value: 'History', label: 'History' },
    { value: 'Philosophy', label: 'Philosophy' },
    { value: 'Psychology', label: 'Psychology' },
    { value: 'Self-Help', label: 'Self-Help' },
    { value: 'Business', label: 'Business' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Science', label: 'Science' },
    { value: 'Health', label: 'Health' },
    { value: 'Cooking', label: 'Cooking' },
    { value: 'Travel', label: 'Travel' },
    { value: 'Art', label: 'Art' },
    { value: 'Music', label: 'Music' },
    { value: 'Poetry', label: 'Poetry' },
    { value: 'Drama', label: 'Drama' },
    { value: 'Comedy', label: 'Comedy' },
    { value: 'Adventure', label: 'Adventure' },
    { value: 'Crime', label: 'Crime' },
    { value: 'Young Adult', label: 'Young Adult' },
    { value: 'Children', label: 'Children' },
    { value: 'Education', label: 'Education' },
    { value: 'Religion', label: 'Religion' },
    { value: 'Politics', label: 'Politics' },
    { value: 'Sports', label: 'Sports' },
    { value: 'Experimental', label: 'Experimental' },
    { value: 'Other', label: 'Other' }
];

// Zod validation schema
const bookSchema = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(255, 'Title cannot be longer than 255 characters'),
    author: z
        .string()
        .max(255, 'Author name cannot be longer than 255 characters')
        .optional()
        .or(z.literal('')),
    isbn: z
        .string()
        .min(1, 'ISBN is required'),
    publicationDate: z
        .date()
        .optional()
        .nullable()
        .refine((date) => {
            if (!date) return true; // Optional field
            return date <= new Date();
        }, 'Publication date cannot be in the future'),
    genre: z
        .string()
        .optional()
        .nullable(),
    numberOfCopies: z
        .number({ 
            required_error: 'Number of copies is required',
            invalid_type_error: 'Number of copies must be a number'
        })
        .min(1, 'Number of copies must be greater than 0')
        .int('Number of copies must be a whole number')
});

export default function BookForm(props) {
    const { book } = props;

    const isEditing = book !== null && book !== undefined;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset
    } = useForm({
        resolver: zodResolver(bookSchema),
        defaultValues: {
            title: book?.title || '',
            author: book?.author || '',
            isbn: book?.isbn || '',
            publicationDate: book?.publicationDate ? new Date(book.publicationDate) : null,
            genre: book?.genre || null,
            numberOfCopies: book?.numberOfCopies || 1
        }
    });

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);

        try {
            // Format the data for API
            const formattedData = {
                ...data,
                numberOfCopies: parseInt(data.numberOfCopies, 10),
                publicationDate: data.publicationDate ? data.publicationDate.toISOString().split('T')[0] : null
            };

            const url = isEditing ? `/api/books/${book.id}` : '/api/books';
            const method = isEditing ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': method === 'PATCH' ? 'application/merge-patch+json' : 'application/ld+json',
                },
                body: JSON.stringify(formattedData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 422 && errorData.violations) {
                    // Handle validation errors
                    const errorMessages = errorData.violations.map(v => `${v.propertyPath}: ${v.message}`).join('\n');
                    throw new Error(errorMessages);
                } else {
                    throw new Error(errorData.detail || 'An error occurred while saving the book');
                }
            }

            const result = await response.json();
            setSubmitSuccess(true);
            
            // Redirect to the book detail page
            setTimeout(() => {
                window.location.href = `/books`;
            }, 1000); // Show success message for 1 second before redirecting

            // Optional: Call a callback if provided
            if (props.onSuccess) {
                props.onSuccess(result);
            }

        } catch (error) {
            setSubmitError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedGenre = GENRES.find(g => g.value === book?.genre) || null;

    return (
        <div className="book-form">
            <h2>{isEditing ? 'Edit Book' : 'Add New Book'}</h2>
            
            {submitSuccess && (
                <div className="alert alert-success">
                    Book {isEditing ? 'updated' : 'created'} successfully!
                </div>
            )}

            {submitError && (
                <div className="alert alert-error">
                    <pre>{submitError}</pre>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="book-form__form">
                <div className="form-group">
                    <label htmlFor="title">Title *</label>
                    <input
                        id="title"
                        type="text"
                        {...register('title')}
                        className={errors.title ? 'error' : ''}
                    />
                    {errors.title && <span className="error-message">{errors.title.message}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="author">Author</label>
                    <input
                        id="author"
                        type="text"
                        {...register('author')}
                        className={errors.author ? 'error' : ''}
                    />
                    {errors.author && <span className="error-message">{errors.author.message}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="isbn">ISBN *</label>
                    <input
                        id="isbn"
                        type="text"
                        {...register('isbn')}
                        className={errors.isbn ? 'error' : ''}
                        placeholder="e.g., 978-3-16-148410-0"
                    />
                    {errors.isbn && <span className="error-message">{errors.isbn.message}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="publicationDate">Publication Date</label>
                    <Controller
                        name="publicationDate"
                        control={control}
                        render={({ field }) => (
                            <DatePicker
                                selected={field.value}
                                onChange={(date) => field.onChange(date)}
                                dateFormat="yyyy-MM-dd"
                                placeholderText="Select publication date"
                                isClearable
                                showYearDropdown
                                showMonthDropdown
                                dropdownMode="select"
                                maxDate={new Date()}
                                className={`date-picker-input ${errors.publicationDate ? 'error' : ''}`}
                                wrapperClassName="react-datepicker-wrapper"
                            />
                        )}
                    />
                    {errors.publicationDate && <span className="error-message">{errors.publicationDate.message}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="genre">Genre</label>
                    <Controller
                        name="genre"
                        control={control}
                        render={({ field }) => (
                            <Select
                                {...field}
                                options={GENRES}
                                value={GENRES.find(g => g.value === field.value) || null}
                                onChange={(option) => field.onChange(option?.value || null)}
                                isClearable
                                placeholder="Select a genre..."
                                className={errors.genre ? 'react-select-error' : ''}
                                classNamePrefix="react-select"
                            />
                        )}
                    />
                    {errors.genre && <span className="error-message">{errors.genre.message}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="numberOfCopies">Number of Copies *</label>
                    <input
                        id="numberOfCopies"
                        type="number"
                        min="1"
                        {...register('numberOfCopies', { valueAsNumber: true })}
                        className={errors.numberOfCopies ? 'error' : ''}
                    />
                    {errors.numberOfCopies && <span className="error-message">{errors.numberOfCopies.message}</span>}
                </div>

                <div className="form-actions">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="btn btn-primary"
                    >
                        {isSubmitting ? 'Saving...' : (isEditing ? 'Update Book' : 'Create Book')}
                    </button>
                    
                    {props.onCancel && (
                        <button 
                            type="button" 
                            onClick={props.onCancel}
                            className="btn btn-secondary"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
