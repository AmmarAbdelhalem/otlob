<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CategoryResource\Pages;
use App\Models\Category;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class CategoryResource extends Resource
{
    protected static ?string $model = Category::class;

    protected static ?string $navigationIcon = 'heroicon-o-tag';

    protected static ?string $navigationGroup = 'Auto Parts Catalog';

    protected static ?int $navigationSort = 2;

    protected static ?string $recordTitleAttribute = 'name_en';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Category Details')
                    ->schema([
                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\TextInput::make('name_en')
                                    ->label('Category Name (EN)')
                                    ->required()
                                    ->live(onBlur: true)
                                    ->afterStateUpdated(function (string $operation, $state, Forms\Set $set) {
                                        if ($operation === 'create') {
                                            $set('slug', Str::slug($state));
                                        }
                                    }),
                                Forms\Components\TextInput::make('name_ar')
                                    ->label('اسم الفئة (AR)')
                                    ->required(),
                                Forms\Components\TextInput::make('slug')
                                    ->required()
                                    ->unique(ignoreRecord: true)
                                    ->prefix('/'),
                                Forms\Components\Select::make('parent_id')
                                    ->relationship('parent', 'name_en')
                                    ->label('Parent Category')
                                    ->searchable()
                                    ->preload()
                                    ->placeholder('Top-level category (None)'),
                            ]),

                        Forms\Components\RichEditor::make('description')
                            ->label('Category Buying Guide & Description')
                            ->fileAttachmentsDisk('public')
                            ->fileAttachmentsDirectory('categories/editor')
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('Media & Display')
                    ->schema([
                        Forms\Components\Grid::make(3)
                            ->schema([
                                Forms\Components\FileUpload::make('image')
                                    ->image()
                                    ->disk('public')
                                    ->directory('categories/images')
                                    ->imageCropAspectRatio('1:1'),
                                Forms\Components\TextInput::make('icon')
                                    ->label('Icon Identifier / Heroicon')
                                    ->placeholder('heroicon-o-sparkles'),
                                Forms\Components\TextInput::make('sort_order')
                                    ->label('Display Order')
                                    ->numeric()
                                    ->default(0),
                            ]),
                        Forms\Components\Toggle::make('is_active')
                            ->label('Active in Storefront')
                            ->default(true)
                            ->required(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('image')
                    ->circular(),
                Tables\Columns\TextColumn::make('name_en')
                    ->label('Category Name (EN)')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),
                Tables\Columns\TextColumn::make('name_ar')
                    ->label('اسم الفئة')
                    ->searchable(),
                Tables\Columns\TextColumn::make('parent.name_en')
                    ->label('Parent')
                    ->badge()
                    ->color('gray')
                    ->placeholder('Top-Level'),
                Tables\Columns\TextColumn::make('sort_order')
                    ->label('Order')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\ToggleColumn::make('is_active')
                    ->label('Active'),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime('M d, Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Status')
                    ->boolean(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCategories::route('/'),
            'create' => Pages\CreateCategory::route('/create'),
            'edit' => Pages\EditCategory::route('/{record}/edit'),
        ];
    }
}
